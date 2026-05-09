#!/usr/bin/env sh
set -eu
# usage: ./install-equinor-certificate.sh [--silent] debian | alpine | redhat | python [pip] | file [file-name | -] | java <path-to-keystore> [keystore-password]

if [ "${TRACE-0}" = "1" ]; then
    set -o xtrace
fi

abort() {
    echo "$1" >/dev/stderr
    exit 1
}

help() {
    abort "A target must be given for the installation. Currently, debian, alpine, redhat, python, java, and file are supported"
}

if [ $# -eq 0 ]; then
    help
fi

# Options
BE_SILENT="false"

while [ $# -gt 0 ]; do
    case $1 in
    --silent)
        BE_SILENT="true"
        shift
        ;;
    --offline)
        echo "The --offline option is no longer needed, as it is the only option" >/dev/stderr
        shift
        ;;
    --*)
        abort "Unknown option $1"
        ;;
    *)
        break
        ;;
    esac
done

if [ -z "${1:-}" ]; then
    help
fi
TARGET="$1"

# Default functions
pre_install() {
    true
}

# shellcheck disable=SC2317,SC2329
# Ignore "unreachable code", it is used as a placeholder
placement() {
    true
}

post_install() {
    true
}

readonly WORK_DIR="${TMPDIR:-/tmp}/equinor-certificates"

cleanup() {
    rm -rf "$WORK_DIR"
}

# Make sure cleanup is called whenever the script exists
trap cleanup EXIT

_openssl() {
    # Simple wrapper around openssl, to give a nice message if it is called, but does not exist
    if [ ! "$(command -v openssl)" ]; then
        abort "I require OpenSSL to work. Please install it."
    fi
    openssl "$@"
}

find_python_executable() {
    if [ "$(command -v python3)" ] && [ "$(python3 --version 2>/dev/null)" ]; then
        echo python3
        return 0
    elif [ "$(command -v python)" ] && [ "$(python --version 2>/dev/null)" ]; then
        echo python
        return 0
    elif [ "$(command -v py)" ] && [ "$(py --version 2>/dev/null)" ]; then
        echo py
        return 0
    else
        abort "I was asked to install the certificates in Python, but Python does not seem to be installed"
    fi
}

if [ "$TARGET" = "python" ]; then
    # Check if the Python executable exists
    python_executable="$(find_python_executable)"
    _python() {
        "$python_executable" "$@"
    }

    if [ "${2:-}" = "pip" ]; then
        TARGET="pip"
    elif [ -n "${2:-}" ]; then
        abort "python takes an optional argument of 'pip', but $2 was provided"
    elif ! _python -m certifi >/dev/null 2>&1; then
        abort "Python does not have certifi installed, which is where I'll place the certificates"
    fi
    if [ "$TARGET" = "python" ]; then
        SITE_PACKAGES=$(_python -c 'import sysconfig; print(sysconfig.get_paths()["purelib"])')
    elif [ "$TARGET" = "pip" ]; then
        SITE_PACKAGES="$(_python -m pip show pip | sed -n 's/Location: //p')/pip/_vendor"
    else
        abort "Unknown target $TARGET"
    fi
    readonly SITE_PACKAGES

    placement() {
        certificate="$1"
        cat "$certificate" >>"$SITE_PACKAGES/certifi/cacert.pem"
    }
elif [ "$TARGET" = "debian" ]; then

    if [ -d "/usr/local/share/ca-certificates/" ]; then
        # Regular debian installation

        placement() {
            file="$2"
            certificate="$1"
            mv "$certificate" "/usr/local/share/ca-certificates/$file"
        }

        post_install() {
            update-ca-certificates
        }
    elif [ -f /etc/ssl/certs/ca-certificates.crt ]; then
        # Presumably, this is a docker hardened image based on debian, which stores the certificates once,
        # have not executed update-ca-certificates before.

        placement() {
            certificate="$1"
            cat "$certificate" >>/etc/ssl/certs/ca-certificates.crt
        }
    else
        abort "I was led to believe this is a Debian-based system, but none of the expected certificate locations exist."
    fi

elif [ "$TARGET" = "alpine" ]; then

    placement() {
        certificate="$1"
        cat "$certificate" >>/etc/ssl/cert.pem
    }

elif [ "$TARGET" = "redhat" ]; then

    placement() {
        file="$2"
        certificate="$1"
        mv "$certificate" "/etc/pki/ca-trust/source/anchors/$file"
    }

    post_install() {
        update-ca-trust
    }

elif [ "$TARGET" = "file" ]; then
    bundle_name="${2:-ca-bundle.pem}"
    if [ "$bundle_name" = "-" ]; then
        # Most UNIX utilities can take '-' as an argument which either makes the utility
        # read from /dev/stdin or write to /dev/stdout.
        bundle_name="/dev/stdout"
    fi
    readonly bundle_name
    if [ "$bundle_name" = "/dev/stdout" ]; then
        # When redirecting to standard output,
        # the result will be corrupted if it includes the status updates of the script
        BE_SILENT="true"
    else
        pre_install() {
            # Remove it if it exists, in order to not repeatedly add the same certificates
            rm -f "$bundle_name"
        }
    fi

    placement() {
        certificate="$1"
        cat "$certificate" >>"$bundle_name"
    }
elif [ "$TARGET" = "java" ]; then
    if [ ! "$(command -v keytool)" ]; then
        abort "When installing certificates into $TARGET, keytool is required"
    fi
    readonly keystore="${2?A path to the keystore is required}"
    readonly password="${3:-changeit}"

    placement() {
        certificate="$1"
        file_name="$2"
        has_certificate=$(keytool \
            -list \
            -storepass "$password" \
            -keystore "$keystore" |
            grep "$file_name" || true)
        import_certificate() {
            keytool \
                -import \
                -noprompt \
                -storepass "$password" \
                -trustcacerts \
                -alias "$file_name" \
                -file "$certificate" \
                -keystore "$keystore"
        }
        if [ -z "$has_certificate" ]; then
            if [ "$BE_SILENT" = "true" ]; then
                import_certificate >/dev/null 2>&1
            else
                import_certificate
            fi
        fi
    }
else
    abort "Unfortunately, I can't add the certificates to $TARGET"
fi

convert_certificate() {
    while [ $# -gt 0 ]; do
        case "$1" in
        "--from")
            from="$2"
            shift
            shift
            ;;
        "--to")
            to="$2"
            shift
            shift
            ;;
        *)
            certificate="$1"
            shift
            ;;
        esac
    done

    if [ "$from" = "AUTO" ]; then
        if [ "$(head -n 1 "$certificate" | tr -d '\r\n')" = "-----BEGIN CERTIFICATE-----" ]; then
            from="PEM"
        else
            from="DER"
        fi
    fi

    if [ "$to" = "PEM" ]; then
        # Supported
        if [ "$from" = "PEM" ]; then
            echo "$certificate"
        elif [ "$from" = "DER" ]; then
            output="${2:-"${certificate%.*}.pem"}"
            inform="${3:-der}"
            _openssl x509 -inform "$inform" -in "$certificate" -out "$output"
            echo "$output"
        fi
    elif [ "$to" = "DER" ]; then
        if [ "$from" = "DER" ]; then
            echo "$certificate"
        else
            abort "Converting to DER is not supported yet"
        fi
    else
        abort "Unknown format, $to"
    fi
}

readonly BUNDLED_CERTIFICATES="$WORK_DIR/bundled"

bundled_certificates() {
    # BEGIN BUNDLED_CERTIFICATE
    readonly certificate_bundle='
H4sICKNOOWgCA2J1bmRsZS50YXIA7b1Hl6NY2rb7jmOt+A_fnHUOXoLBO8ALEN4zw3srEIJff1Bmmeyq6so2q7+u011MItYOJWK7574es8ksGdv_N5mX__k
XXtB5XTDsy8_z+uVP7IJe_gfGMOSK4ufHzs_BCHbF_+f_QP_zf+FaH0s0n4+STWvVD_Nf_dz3_v7_0+v_eV80J4jq_2E40xZ5kaFs7kvr54ciigLEMgx9rw
pqE2mqEO079b6kh21010llEXyjvl41pdJFM5VNJZAbRFPGg__8oFgaVUxl44xAZkKxq0J9vwsGLZgBGyDkopjJxv_6b7fQ5+HIw5+fH0nN3RWqESjY4ehSY
eyGeIksldGF6tLUYPOQ+0q9do1RsTBclRYZqNBs8VBrCldYDjl7YRYbXwSsaxgst5F84rtj3JG7yEvPGDUKA+K2W5moSq1sqs3tClscik1t3rvtULbPjx9a
oS+tNY0pxmNjjC93FLhN0uyDs5VzEJmis6Shs4nq1VBm41GI+oxtzj+fgXZ+9Vca+enJv9ujz49v+6SYzcZvP_ToRf_cI+41hkgJiZxKn3PHiN_MyefH11n
heIrSGKogqPcnmEI+f+eow81HWJsQsnD5ERh0N3h4pFS1de0pwJBWKME7nx8MvBs8yXOksL3HotFH0SSAGoVIQQy3WhiifC+ocSS6DAKBxgpVsGVuck0g1j
IFl+rzA4idsTpG3MLCyb2U2P3edsmdK9nIR+s7ItYCgTN8Moxs38lmbUzVJJqvWiwrXbgkWPz5Ee5eTlxiJs495hhzpXP6DiK97FHXL5GHak81bLkfbC0Xm
wu+NWBETbERZc1ju9qMQH1+6Prl6l96MmwgtSVtQWbGjBvwCwcvPK67+mUC8Em6IQNN0FMgsqGIXMFwBZwQhiZcpT8_KpnKnGATbUE9ksWiEODSmM6RQ7dm
aCbcdB_wDPoLDcBIi1JZdakav3N2txCIFQm08fPDCGxsmWN6OAfOZcg4HSlJxIVk4gYsRcD6uU3yFaeBbbgvSrUtt+cDQH3aV_1tm_VF_Pxo2oAaij2tng1
UkkQ4M91L4vvDQ8iDSxM37SuJpQZljMNdBLW8gGXGoD2SPMJIflWXzw9Ra8XSvUiABFxwT24s018WQZZxR9afTJuYHH7n4jsIDndc6SfP7CEQ9vgrmRODGC
7nHe6OsWFOpZedV2xg0XlxgpUVkHUhxw73KuUlF4BT0GVLtW_yPQ8YqFeqbH2+yMeq1OfuLle3v5mSZ1FQ3Vh+wWiKAUb98Hz6HB8NKOAlhebcR4TsGOaWv
7KBEG_odRuOuX_ZybmqDb24rJHDUBtHUdG5sl1xKwpeU2hKYKyHQBkGXdSJe_5k3ytdoaG3LUnZwvBo2gw+P4Td0gPO9LdL70PHXMdYl_S2q_cHfXvvyZtF
cee_BRR2ExiB4YyC0847cQpLbfciOOdC3gKaNpzb2eqJXQmlN+py38ktQpr1R0uWVHgdI9AzEczjjtJNsuNbKASbYATSD3c4H1h9GQxNbRlT0DZ1c6igoFm
K4zbmvdtNSD838NkLQVBo8UsvuI2jwc04n0GhAprKCYYyqO329dM1TZ+Wb6Ac82mmFPu46XJlhJaJCMlBstuFwINgU6kvn80_P2gG2uSDGgcmK6QgqKObCS
Xs8Dyfdo4svP3Ryty706pZZJ102zP01O3ds_P3007qWyD+NBbGOUIH9VIYQmCY9zw4PH1QTFmpQ3ozN60izrFYxnv3k7VbPz_emnBH+DGwyDZA6fd37Sn7a
2X5asM4KuJeVlKfS7q_FNd+PZ8hvFF+Mr6uomzQWNi44pGP_rTk8JFfZYLAZkK2F8rxHXMFd4ggmhXzzBqGTScczOj1OHc3LArwjTswXoV0HJVYF9PqsOkj
HLirZbsJhP_aXR8vKz5c8jk1JXwmy3injFRdnxn7+cHN1wQlPEfi4I3jkHuHXVOWYC1+J0G6bfchu_t3LhiZNVoyGMTTwjfGK4bqUKAno3zui+F5IeSmauE
rXm9e0ApeaeE4YcqQe0WAkIXCMUok2xmptSJe00spReZ1iLexLoUnXp3PwDTdoBCSWaSlZsC+dgv4h0PHKmBJSdztj0kVHmsRYUKyKqbXRJvBEr1+Diw30P
CLtj8_0AJ8tIxucCCjtcCuu86+aOplhAIj8aPbzO8u3E+Vo0cGINiDOJN4knd14NxkVXeE_dSs_cIBd7bP_dgBoZkjdMZAcl9nJsEgW8kx0UxW9wPW+x3xp
2G3DXTCQVG3MOUQiP29ux+kMZgaVCU2JaaVtEpRMJK09UqdBQobsX+Za2gIGXCgxymcYdqnlKf1TmnlulaJ8udHekzjTcJulGPzJcUwFAe4ywE27LQ+LhNu
Kf0y3ZHiJd98qfM8YZXgNB6c4LpZY0QrJ8PgN+9hSDNy90gETT31qRwFwVeKS826z_AEBL00xomcvlCz5oqaGFCTL2o57chhlkvefH7sLyAdSNgzIBphU7U
bkmcmkGwgE9z_fn58gS1OZX8DwP71_Jed_B9l_1oP4Hv8j12_8D8KoQiOvtth5HpB_uT_PwT_V_XJ_zf5F_yvU2CNaEH_IOgf+f_4D+F_WGEdSLUp6C_4_9
0Kf2mt6eu_n_+3TfixRy_1G_7n+b_mA5ys9dPM_LYPMFI+0iFdhh8vu4aUy+QFc+ynuMVcqBCHT2WUngJ_I173KoipTdMXFxLb+YUWZLb2i6MDNOxPxv4EW
PsmFZhFYLr29FQxJfnYQyem+_zo_RIRZjZU7Ym+RbfE3T1Nul9zdVhAX_SZCrtyc4Fl1myoHAdPYxRd63lT7xkcHymKn+vBfbpu5hpXodW1Qz9NcNMSL68g
aXWOrlQRsvfGdi2Zs7nXPoGRKARtG_CqbUBxV8HkOZJunRe5X1JJLYwKHOtNMV9YaoQd2JhBIcL9DlwfhZ4s4nUb75wns0rhPfBJpyq6B+rPD4fmPAWmnpD
LavuG3jsBvpYH8KRak+x8VmQa2BK4m1_UYoDHfWzqjdg+zNMJGYLp5p_qPFGjxMndhhH71c6kZlGKeS5xVdKfwIucbBgpBXa9hdZlb9gtslAlTFg8oTOxjl
Bjvn1+WFr_vBt3bs8XWFPKbMsiJ6XpwRRJxWZ1N6t8CV9NFrIAxlf4ZzG3ckewadgHWNsC3pu9rbbawnTVO4PHn2O_3RKk6aHgvqmvsBjGzO+fOFHLz5mmu
PeQ8iJq+tJiqlt2FeDPD4i6PNkXIFd5pskgD+bkqKBBFbsClrj8CUNhaAT8Szx2KIObbCEJo9h6sG+tUTcKVT85Z+5XDMMc1csi7AlJ11e97_phO1BFuBNC
ADpQXeRr+uR8umLGgBgtqeo5pIzjXOaQcz0ABNVzRHtpeeVnH8BoTh+A4_8WH+DkXtqYDry9GslJi00vzgLdWoffyE_Kdm0qPHfPTJ+8TwUiylMix9KYTPE
KlRp0RXHK6VEaNnX_4ikYBEdT53OcXM0VX7japowbeBrO7bzDSeqnDWWp_KtXoXACS3kFbb59cx6itC0hJolupVsQHjqks_PRljUFffm0SXB3m5oVpiukC9
X+kqJPX+wbjv5K0eoeMz9TdMxSIF0U757wtJGcVsA4Tluy3X9g9nMcTmpXKFkQkd_3YAKvLe+IWye385tQCVIo6Bzl6eyFJcYoa3A0szkUhZ1KYtAByl4uh
+yNS0sKBVAF813DQoFmXa2jZniStaeud2mcwdfonAv1ifgNdOIYQOnFRA4gUQ+GmVNqGfuXuXQWMFfNdV9vmkRP_Ov2gDWMFIx+9vf+gFTj82N+rlJ1yUf0
esUhoXc6M+RXw293w6nYIog137+lGnbOg4G6jXHa4eViMxntx31vzc_TPoTcLZ39ToACRfVl6vp4LUO60xvYj8zFrERFRi+KEBENmvRJyK52deudedgZN59
h3DtVr1TlPZ_xmiOJ2DOuNCRKFoti7vkwdngvO+Dei3GmCJvoJ9z8uugq3Ne+g2zTg4+usHb6IIJk9JfRpeH9NjSuK7ZKR68M5EQFwmkwDZQdTWpELo9gTD
hHMNHahHL+Heojyln29vPjkAGDASpQtp1SDCsBLDPAlkL5Gcjc4zQea0Jw3DxBiCR3wa1Fo7Yblg7suasV6_B+zsW50OQAfipPpcadxl+SQdJuV_wmFLleH
3c2EC_PWSZyuMnbtaBc1iEaOSwL3DOMVHmdI3mIAxEXA0UXmPrwPIZ+6KdMndJFVNLuDEnK0ehedW7njuqximhuO3E_15ejbSVGO8DPj9xuu5jK2wZg_YzC
cB0klmKTO3qxX3JxqZZziu+lAETxwl678aFlMzyUtBBJuVUtk3XaKJq49gCUxnpPSYvKoZLWVcjsqbtJ8rfVssW6CdNwqnEi4FNihZknJrR9tGfG2hv_++_
m8_87_J8lyb_QBfgO_yMX+OR_HIIvCHZFMPTkfxTD4D_5_4_A_yxynD7zcfmJ_70vsB+0hd5FGDkRxw_8T9eUfOrLyf+1pp86S7P09c3e_zj7v8n_Hdf6x9
n_zcmfH79Jyj+zf2E6KqvQmM_a4pvyT1WkMKUWdxUezjbl5JyfWo8vrVt+_Non4Q7KpItBaqpIakDxEVJcyBfqWzFfnx_8Qbm__mv6U0xNsajt9vU5Ze6Vf
kv0tmFRy+eHyDa7cgSbZlMvteaK84m_fD_1UnzzJ4WmadOilchLh5ShWcOieQNStiJ8nONwAsxNHkLxqKFTmQNexk6mYZRTFAOKpihPu3fgERSLdCmfXHCn
+N6+5j4swKoRWPEQneztwA8ThzP2UNAtayoupnABsFfsdRi4Y3pt+EgAMCGPLoSYPdd0qkc8is7gh_jiosH5_CAealvGtTaYOKJP840yNRO64Vo5BzvqqMg
p9cf4uhVIFiw0r48xVbeJRo44ewOrtks_P7Aa3YJrLtVpsT_kd7y3eMd7HYV6fGW6zeDea_UkJ+MvyM3gvrS_fVIq_UprGMcXhmNiOC8owitGeU4Kxwc1Xu
vUydwBbDbzayS1oM9_q9cUQRfl6YuVnEizhUjTLLUpDPZzfPO8P19JfzW++YXLULo5R_Jkq_CmrIlgdgrdfEupDlUYyu1UTWejYUoQKWOj6b8v3pvAIr2Sx
y3Dn1sDA4yhLURizeO6ipu6_RTvfceva+oxMFMhi0H3N8d7O7cOdvz0g95RX6P4y5jvufcghRV_EfMNf3NMPj9+ptWfY77nd9Q_xH3_0qJQGv3OQ57rlTFc
5IVi4rkmfW272cigRnenQlsgsQlV0HDcPn2c5lXquzsLLn5o0PEEOTjetV0BcjhKt+06TQAlnLSGasOW+UF2waPF1xWZani8pfmsRRuRlgvPYYs62m3heY2
mZ1RpcDhpa76vz75psblGz14I6UTVThoYdqrKETzTAp7m7JVwwz6dn5UzK_fwShT79ofjibf+_2vV_2_Rf+iL_uM4jqIo_NZ_GPkz_vcH0f_6rf_rL_RfZI
Z00O7IomrGT_n__wz937Xzk0odQJr7jf5_bT2+tG45+2_X_1ShHz_qv_ON_v+m9r+V__Pjr2s_W2FLTBtWOlxUJHdX5dFX0_UGe0LFgsecL8hR6_3nR7Cw3
GY84k7H1EMEqLCe7bkCYOEuV4NTq4SbjClRpEv7ZPM6L04FDl3TGG+wXkXn5Hx+2EDrJ8rYitJlvMacsUz53fbkJlcB_nkh7xr8SmHJ8lNkbtVauWLxLmHs
zbVXmnec+FROpiexnCS16z+g_W_lP3XvG+0n+sPxMZrgiRhsMSeoxJFWYvuaRMZvav9b+T8__hntfyv_O0v5j2v_W_lPivkntP_97J8f_4z2f833_jPa_9v
53t_T_pp6a3_BGAXzgMx9jvWo_fxQXed06CtinYIuSyXnyXApVkCNRViDjjwd8Xq9Ut79Csnx5aLsagwhRx_7m0PL3oDr53qAWerKA+lGPllrLySG0m9S_Y
zEx1b65TMWAXoYcd9npqs8POfr5eXWcW6y2KNsoO3annfw8PsCEBWmVnixNiKZoK4TDvZesONkNZ5ppy0+5Zz3O9r_b_T_+393_d_p9f+Y_7vAOPKl_u8C_
an_f4z837v+78b8Iv9nXOmWVikQzvsf_X_2Pyj_Bys1t_0y_xdsX1prGv_35_+GTaB+pBr+G1o4GaCDy_it__bJbZW4sUYgvZX_9FqfiXpa6dNaU2xRiDp1
zixVDMz5O03JRTmoLMERz2xOEhzPk6aggGqZZxx7oVNmtuc49NvEwAhn37gqcgWX9MR22UPQIwvhqTdURxhMaueius4UMy_gs8aj+VizuHT3Cr95J0m99Bf
Lp1Eh3GgJV7elHsBEgB03t4B8oi+aV1Gt0dbWdOreWF_xo0O5cXfzDXliiuyeDFJTQDvfGTLeL3I40G7RkCVZZThV3YQ2yHAguNS+mF6FS12PIfK8UY3Fle
hDIWjAKm+n5kSi7j+njZwGCtJXAF6ocbA4BtvSwmqaeJLkZLbjlFyY0tUZtkdF9HVlIAQ9LkxlKvrnR+YW3JG1DoAxN9rKnpqjkhF5sofQB7EMmmaEHg75w
PoHm6sq0BdaOa4LbGUNCmhlaH1+SFE9PxeePT85ezXVQjHK3dA7Y84JUtLBy9yaJGJKyaselDcv_sO0XkMS6KguzMa2xZ8fxVPByFyVoE5okB3ocNC5Qj6R
9FcGe2zSfFdiL1vYuNjlrMkv0Mb64qgJ1F0fNEm4JZ8fD9jwBX5+1ZW00sEJ82TR1ls7sYXm3tJlcUOi8dfoICwL3RPmyr8wkpOeg6cJBG+lp+_NUwrn6H3
GZCNaBHu+3JQLb4+umD3Th9BPo5eEA5MhJVTRVL3VUTYDnniw5YjbizKeTLr3Cr8cWBnZLrbOoPbgWPbemmZugcMxMkkX6KsdP914Qu7+FJIMqG9TvNVQ2B
4Ag2qn9w4dvi+qLlUoNEUJdVFw0mm3aNr+6wz4LQF+fvjHU0kASBPlQWmfsOUA+HxjuX0rsC_Ved+rzTuZ9DvVed+rzXvbyd+vzvtebd5pJ79Tnfe92ryTi
79Tnfe92rwfK4x_rs4bhk6pCLte6rtU0_KGKJTwNDvgXCqP9lGIN8l4PQmosgLyzi72fPoHmxYAizPMlkeU0Z43tdQwoJ+tnJtB2HX0ygLRTRA0LBASgn1C
s_gg0S3sFUOpF+NcD8XFTzRY9yOwqxzUVL1UmmqSijDVTJ77OKyu7gck8bgivBUKr_kJIGmYWhDYADh6fWfOJgzTcgPa6zZVcotmoQRxaNeZ9t0jvUfwuiw
ech18FwabBy0ol57SlTBH26gc4o2+nXuTUJHRyPot5XwdvCP3PnzoZbJjKtpxgMcOeCHfHH+VwWcU5XZPTxYfOA3qQUKrhOBMfn7ohz1p2TnBFn+HYnNqDb
qcpNerbZiXevp7XTs6UcxVgqlwt6GPu5pivJ5OMU8t8Oeufn7EUwdN6yjyIJbDcR16oDVwIwHQHm2XnlFJFrY5HdtxTQXDAO6AFr9pMF8kiZGO1nz67irs3
y_JsQDDvL6A_uVG5CMQDYNa+v6GuFcwR16scCqNMU2jU7gm35VPosvNaw8wIZZ_fuSy1JCaVz7rIT3ugO7DGPPwp2GIrqyjYM8Xvi4hmcCehJ_0p+aPFPDu
D6A119gnruZ+WtrCedxx2WQiZI4Mkmno4XrjJDTtQjWCNuFyrTfp6EHLppYrSU_Plb9PcWnLRhwr9+P++ZE++sG+rH29ulZJaCrIZhQSLCXSmd5lNl2Na7T
SqKN8nqgs3_2AobTSfg4B7vyn5_5+5P8_UP3f5Yrj7_gfBKF_8v8fg_+PN_9rv+B_X0DmRmsY_6kUP_C__Z_E_xqroL_m_y+tNU38+_n_NH0_nf8xf1H_99
s+wNf43+_7AOmlHcHZmUFTrgamfil6Pl0m0sw83m1Obb25t5IfG9R_4cymtUujM5XAWPIgERf2kG60hiAaNpkvGZzyUYBJca9fkK0VS+2KgnUqY7cQMegdy
Yla97Crm7JLcn+ww8vOIb4qe49SLCdxoFRuGcfklfhJ2DzgxBuwl5RU1vH5Ec6O6TG0ntiQwZGOoSwrLQaT7qxmedll6kq9_Fxybqjv0VbhC8vLqQQ0YA3f
wtjEPLmX0dBtAZBMpRMG7u7XR64d7EXvavxRYjVQdeulx8ysF9JrIHZ1O8Didk_DZ7QLufm8Zm_WerGa20A5NsTrrlep95DqWzLhYpT2Ferfg5mPpjEQQwi
qw2dlVtKwRliA3hecEZnL58cqySribEqq+doxootCuYW_LG3hcjgE0p5fp9kV8XKsaQr56tQbKw1eqm4pugZXcaZPXdM4QMTI8BFWc786UyIEr8leaPOqOp
eDgcD7Ta_qQUHhJUik8YEQLVCl5qvEGtFt8tMHuc95bbELjzfwbbw+_OVB6NdJZsCDEbe9btB5A3IXMisqYBS9DIHH0xzWneTgOWPR6PTFyqi62beok7mkh
CUxwvxx1vI1aslnPyP4tEJrKohes86SV0ThggesrHIM+FTip1lf31FtAOqQ6cHiI4ey+0g3z3YQKvCkodUYH8_o0c9Xg5sr3p0SR7AZLJH4pqO4OliZe3+c
u_vOXaO4Xrf4qqL_iA9wejGnF4Au7DoCr8gA+slHctNeH+pAr6BEQN_1AU4r9zec0Pk9H+Dz4285ofN7PsDp1f4NJ3R+zwc4e_E3nND5PR_g2wrjn32ApOR
1zTMIKOJlkUziw7AwSRohy0cgKJdCKXDX4B6WKx2dzIm1IAe4FciNkL4jWy7IsjDeqETvdQeRm7wVGeHZeXc_a5csuMt8Dlee1cgVLbOBH9efH095d08ure
MmvWXI4mqYdQRXtXE4gtZMSO63amiuV0edCobFtfvaA3x253qf9QNkIk9yFmOo97eGO0jegyzTcSAsnAQ8RqsataV4TUQztwGovAx5D5UFundeY+hml_TCy
w+R00aRj5td8tfwrha2REwjA9CWbBeIhBd5PswbWKqeLnF9UwC4fHTDYw3pl7iTtMhOUdSdd_CGOnKj1aGbPfaeY_m8PGUWChsjzcSQAXyhQriWu28pIDj4
LPb9AvYIZz4JwNOjZZ3f0R5spSI8HyOTY4IsRlOcu+GhZ7ujyGHl_uI8SCyYtfUw7XjkZcvEtHlb1DucZBT5Cj8_ju0p3NCuoGaUU69D0xomYufO4coo3pX
loo30OpuPV6FWUiuTbH7BTyEAA8_g2SFgxc8PC5GvAZpdE9rzVowDnwH7YIHnVA9650Fwqy+Sq9QdQ8YqTr8y9BQgdWwsrDBdeiqM7rRygQRtZCUls4+B5p
Dr+g3hE0ytLwufGiiAXHqvFCtgQqPpktTdPjfQ1U8I_4rxUKqde5MvWbCk7pFKlgXVlFNnrhdVrYO2jct84A6sCEEXa5wu8WHl8A8AHG4HoBWjui4TJ_4X1
P_1f5T6v2_y_xj2Z_z_j5H_R98MCTG_yP+7Ue8GmYTvx4v6if__a_L_RUC9mIOSvj5HYFMNrv9eT9_j8N2+_lTRx5R_WdHnnM94co519qlWEIVtNsUOXqL9
9RwBTSm2wH0zDo5T2GcPY49_vM8AiZzLGgdzEmN3vGko+WGGTjoqnLkwDErcNPq0jRx1l4zDoSYORW4jEYSAdUVZ8v5yjBxwX_X4+THJq7nipOI9BL8rxmr
mh8rlsD1AqJuvO6ax2_1+3x4ly9+77TLEE4JsKyBTfmrl9nh6c0SLPx6alhJBcL80tygvpWuUag4Sga+BZgxM60vMrV5sGN2ikSVycNiHQdxaryTpaQhObb
3e_am3Jwd4yUcKXQdMpL23F+Mav8Fgvz7_cXLOr06BG22dtHTjHUNqXuKyvyXhZprTcwR09tdnwE8P4udT4OyPp8D_njPgpwfxG6fAvxdn_vZEyefHd86UH
E4hXFElvXYgY_uYRF3Q10teuwtWU+j7s6c3ZxLvM+yrwuyFPFHD72Xqf3mi5J2nf585eZ8roZlfnCs516ixKd+MyftUifQbY3JS62+eK5HaAFF+OFsynHQ6
CZaCkedK5yhMkE+f9VyvEp0fwenN2YUR+8fhNdcyucaOXyxhVJ1ewBTcrwafYQPsil5Q85ErQfrpNT_tRQQyZIABBZrI4NyboXqMuOeGPUAV66vpLq7BGH6
vRerraQXeNozkWifXaxPAi7maN5sMbTye9piI5dYATxtVzkuKVbbmpSSiVpY1SdnFwIPwzu1tqs6TzqJ3_0ZeW7RB_3j1f_2_v_4P+XX93+VP_f8D1f_tv9
B_izPrAWoDDpWLn_L__z31f_a_vf4vU+jtx_o_9xta0GJUWk6j9XPPRCF+6+CpGPtXO3oqlEBb66k1VH3aU4E6scC1p9ooo9dLiVtLS40TKA5NUIqrO8AGB
TAbXJ1zcfOSOrWQ3U4jldOXPtbR2115Ce69xsB5XkW5iIQ2NLt8lZ7YmI9IQKcAPGTwU1ywG_f5AbBpC_st50n3F3MXVkS8IC5MHRfyHg5Jj4qOzEZsockk
Se3M0M9RVjK5t7bXV42r_Kl7rc2qYQa18KOri4IP3nEel_2N85fUt4rq0F_ajXfd2834oqMaTQenZAHaffLmIaTE29QAngZDD1nzIzVPFS75wggiZVIKi20
6FYiBaDLvSAl23kvZ3ur5jfYxlBlU36mke1f9_6j_Pd2E9ffPlxo2ZX09A6q8I0gcw1JfojU38CvJEF+fcjMChY4o_qZaVPxMXugaE5KaFw075zduusRzpb
Bfe3TbjHMcFAbb7jI1DUz1m+r8F9qMSo9faPPjvAP3Ta3fxtE0G2wqS+3fjMlGDX+9uvALQbxHpYw87i_rC_uT5t4E8bVmlaM2gy2CB3Wu5hvV8NJlcTOiu
ZwUM_lRW8h+4HSX_JxftHwRIpkq5lUYu+Q6XgCxzcm6w2MFWokK6Xt23TBZ3OSwY0l_Qt+R1Ksl3S2mthp_oqTT_u25JpARNpFGNGVx4bXSi7X8PGEnYEAv
Ko5wqNbPm+IIU2ed48Dwu3s1Rtm5JG2isL126RDtukKg8JJLratgkFCUXA__gLGEU__H+V9cAPi9_B98Ovtf83_YBf1a_3f50___Y+g_f3n7VuRP_r_Bq71
TT30diKnAPwOaytJ9_603NLFvn7Nkfz8z9r282Lm3fulnf0cpf6GT7dvOKT8qZfKNUhpJR2KZRduhLyGhLxZORz6_VM7bVMZv0HkXClZs57SUp_Zvqk1HZy
v0Y6vGiptyhNFpkbjvUc6p_9_hnO9Rzmmlfo9zLGcTf8oHvr6hHHqP0RIXefVdIdSH7dlvK0bI33xD4O+9GwQNbPzzowpMYUEfoGVgjYdAhFdya3y954S8E
G1eGOtFp6Ck7fbZhoiEX+6LVY44EgI8_5K65PS9m2l1gKek2zR+FzNtperXaEvyTN7rFMH6a5vZoOk+rtJ0lHCP3++Hvj2GFoCc2fKG18lBMddaaLhJibK1
ZZSegHXb7K44rKezlHE9vkzVKQwi2XT6UqVl42CdfPik12dMeQ+9U3N8u4BoZlMizs+0KtoDo4vKqqDHwS_aAmsmmBD0xjFVQJ0EXIaajZiBMUkl+TVMRO+
dI0n2UKHgeY0+CylDJ2+nLoIfavHTdrn7tQ4yKhp2ESmvhnhttWdZQ2DHj16xX7I7X8anarHcQBdAoXL08Fx5bY15a0o2xvcxQAIWS60low31p8Gu0cV4Fa
9VTw+GeAzwjRfs_CQpPK3Kkd2PmzrgliJHTclBSvkQlQ7JZPyCHIFkPJJZcJjGnVoUkW7bYTQ6l3cGPV89+WSx+uBBC98UML+6hucL4O1IQ7vwk4PG4nx2R
IVnNWOud0y0q7A9PMN0C+bmu7tGsfQ5kjPaDreY073F0T0FZqiR8QVb3e8590ClaR60ZzO7HqaGM5aq4HOfeOoJOsC5gEqpDE6idM2+vIm155hpMbd+eMJn
eOm2cwR1WWCyGHyx9sOyt5OGcgqVAvk1QwMGg+YjLBCvPLVXvASPlrRAh9huBCfYp7SDfILuUwDIgHv2cPLoqm9+eDeI6ii8+Bdxonc86Peyddz2F7zI253
ZFh0prmTs3myJ4ItzVdO+dDxe+l9938gPb8j49fsxmOF5M7PPj2x_eYMcY8rajH5tRyuOavKmttDDymOkYndONdNnQqN08iCD0usP312hy8JwYQJ1x_r5sd
PGJPnck5kkIFmj_bY_6nEUUjjRM1IuzxWLPk5Mp2cDuW2OOVGupkW8UqjBy4cx4JzN8U7o2_0F57P8tIlLhQOR_exvyDlI8myeGwMCHlX_gB_ozakitpcGY
zTvuxTxxLso1_j82FQ8uqgwniUeuLK8GFPakV7wJg1CqonGG97a9ws+SzPcCSO3YXT8uK_CCkB4jnKAo35+gDOZPq4DdJmIQCtSfD4y5yIJE12zZuK24fN+
HPzlWmxqcp3uIx1vqAAyESjfwk10k3NfOLeMzi6eu6PbfKL2TN+DykakahvT3UABu6GsePARb4YJRI9ry26OvkARXRsIfWFk_vMD7i_e7CWGMd_ENXEevd2
e3740C+pKgbHOiAVWTQnMfm5HzxIDDMyfLtDGRTW_5NWcf34gxeVpuV3Aj0nTLQPl9hOkcRtMWoyb6zC6xbN8iU_5ytcRX+01SHJ6efDuRp1uAgi_815h9M
L47fK4guueZSKPk2S+BNI8PhO8mdQkKIkKiKsE8Zd7edfB1Jr2VF_NjCI4fElPC2M9dMqYGWaP9VAMXxTT9tAAYbeU7ovYXdtJ8y_jVNz0cqRclj0o3nnmy
I4oN0VGGf9UvRbfsb55BQZ50f2dcTvYLHiEEDOOL70Vmq6aFRb_+99QJfefe538P_+7z_9Al5_e_41dr+_4H4JDf77_44_B_8eb_6_WT_wfV4aXIuI4yiqD
Rwd9S1lEtX+L_2n03x__K97s_fe9+_ulHiL+rv1T2a9t7_hfsZ+tsFf_Y9WMnx9_D+v_Vo8+P77t0_d6VBRi9Uvm+FLf84U62I16f0KmhjeBsJpQdHDAVTo
GFcIhdIrcjjjQab4JiBkR3NHUqV5p1kifH3Z1ak4LUhYWsGvMwZlzn8AgcCwhrXBLUmJWAJf6FfnkAmjtjEKYVIIOWjdQfbIEcWpKoTKeW2dPjx1gWM275y
BE1xkHblcIAxqAaq4nxxwzKgN2GPEVL0Ueszz3iCAFn2+e7zMGpW8WxN7uuaoBl7LFa1CWaXBhuts6rRCzYZVcnMCxUUEHXGz3pZEPOG8Dmgw21eNPQsi9_
mKWQtlc+E7BDoE66aXOHoXxiCBdrDMpXKESxLUL8QxCLQyKUm4Fa4SoLmJjVBY_P1qSydOnX5BXtldW58ptcohzxAHXF3HA5zZZBVAOln4t+qxe3PsVgQIP
78EYFFc7ypWTUlrekdwknvziWULg+yT9Y_evuhQL7MDIoxhWxAP0GhRaQCJFswwHmisxlhnXC3bxAE7u7Qr+llT2UXo56SGqmdUHki+8XRyZbYaUOZ59V1H
7Xr+yPA20VSMbcB_5AByAPV_7d43RfmxQf0xHavB5mZAA6D73e9pyYNlZXuk4FqFuVBnc5hYBfDfsXIV8AiB32bunalze515lnIRPE6AWTVs3CnWXb5Yfll
sadmG5d8q85KKihvnRB_Cit5jjEJQqTEyk2crl4X5+RNt2G2aFrl_xlR3hC8ardDCODCC9vDAROcLNUi0BE3C8zYlkPcwcJ3RvR5PsdEMJzvn8QI1z_xgUP
cDG5tR_x3v47K81gO948A_vgfmdGry_Fk3+VWXt_YfKWpri0Vl6RH7+pGaVsR9RCoEPr+rddrxtuoM9HO7Aw1Em7sHJvXeQCbNFIaQDJcL57u3bWL0u7MMN
gBEogAxL9iVtoQC64Jggq_ecBQ6PwPwhXKnuIp28h6DyYZEOYfUFr1LPebCHkIpMNjOWIiNMOG9mgo1Xf1XVxZ3B0NXZVwe8z1yZSetbpx9UkPVEp_joS2F
lZcO1nXvOcCJ9ZynP17xX9Ljij0W4AczOFIcpCrtW0T0T7_B4uYbqfFo5UadsCYNCecBj8LE7TwoRCs27yxb5fCFwQ6MBfOOy6kWmk+Co4QFUVUcuTybFny
RSnVYuehGDfMGpV3RfxCZ3MnB0nmqGb_1CzHTnRjLlvcB9x_kMe9Jc9GJ48M7s16zqeaUvz72J0H41coX7Gh91MBpaTMI1otuuOhnCMO5wxB05zprB0HMrm
RsrfryMqFPHEq2RmMXP2Rxh2WHGcT+eUwbl3UpO7LmeKrFahijnpFHadmVNemGIYWs+1++5T+isVGwA7C3BtD8_TDUpkAYLq5Lq1FUGOsrQb_f4oR80eL+R
GaakIdTAj+ew70GxpOi9SOjkdKm96ghQ_tSLmvTqrQuf3WNZF6MnG+6hX0embpF7auY7gTJQfDMA0wV1ZcEV_b4nPrfcwBenbZSYnLpJonexwR10YYKim7p
aCQwo9R8wZ3Kaau1gXNG4k5GWEByJVk+c2jNm0ZmoEdIi5rGvP6n+v4b__935fwj5sf4PwbDr1_w_iv3J_38E_me+8H_10_v_DLu6KJErX8NrqnZgWAcDcM
mPX+f+35z8+fHPsP+bk09q_Sdy_+_M_+fH35f7pzDFFrevuX_jS9s7_v_ljYCbAg9bdvz9GY3Pj29zGv9IRuOci59zGolCDz9mNOxvMho_RfZ_rPn7tuLv8
+M3a_5OBGaRRswh_wJWHKiAPuBCG1k4Ytrrd5dADwEBXZeQGOYcyT4LsqitGtviqPz9v1GcykIaWsvFLtHVuYc15S3I+UWgcMpCxPr0NF7DUYeLltql1Jzq
_AbKRwaJbPZSYnDdw_SxV6b98H2gTZ4Yl6HuIjD8yLT+dGLssOBdnIC0jcOXztbf5388axtgbrOPX7CeEWzs9i3rOee3n6x3_PK89++9Ieevcd63uehzTf5
lNhpaAWgfjfHW5_RQq0dY8T5ZbFQcVdqjLCUbLe0GQ7uiBzqEfNSntkoJ1aJsYEmE2xYZeyBmplxMg45AooYSrh9GdLtv71z0zaMrd0RTGkMtMV9gfjJd__
r5MbSjdoGAmQ7SbKqluCpM4thBukK3J+TcYaDz73wdGJPFZpzkrQcQ3Ho8NaDpitkTI_+p739ef15_Xn9ef15_Xn9ef17_ldf_BzJBHEAAeAAA
'
    # END BUNDLED_CERTIFICATE
    echo "$certificate_bundle" | tr '_' '/' | tr -d '\n'
}

install_bundled_certificates() {
    mkdir -p "$BUNDLED_CERTIFICATES"

    set -- '-x'
    if [ "$BE_SILENT" = "false" ]; then
        set -- "$@" \
            '-v'
    fi

    if [ ! "$(command -v gzip)" ]; then
        # When extracting the bundled certificates, we need to be able to decompress using GZip
        # Some distributions (e.g. RedHat Universal base image (ubi) does not include the traditional gzip binary
        # but they may have other programs for decompressing gzip-compressed data
        alternative_command=""
        if [ "$(command -v funzip)" ]; then
            alternative_command=funzip
        elif [ "$(command -v python3)" ]; then
            # Hardened Docker Images with python does not have a cli tool for gzip,
            # but does have the library installed in python
            alternative_command='python3 -c "import gzip, sys; sys.stdout.buffer.write(gzip.decompress(sys.stdin.buffer.read()))"'
        else
            abort "gzip is not installed, and we could not find any suitable alternative."
        fi
        set -- "$@" \
            "-I $alternative_command"
    fi

    bundled_certificates | base64 -d -i - >"$BUNDLED_CERTIFICATES/bundle.tgz"
    tar "$@" -f "$BUNDLED_CERTIFICATES/bundle.tgz" -C "$BUNDLED_CERTIFICATES"

    for certificate in "$BUNDLED_CERTIFICATES"/*.crt; do
        # The certificates are already in the PEM format
        echo "" >>"$certificate" # Add newline
        placement "$certificate" "$(basename "$certificate")"
    done
}

install_certificates() {

    mkdir -p "$WORK_DIR"
    pre_install

    install_bundled_certificates

    post_install
}

install_certificates
