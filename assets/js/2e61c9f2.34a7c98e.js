"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[6563],{8453:(e,t,n)=>{n.d(t,{R:()=>a,x:()=>c});var i=n(6540);const o={},s=i.createContext(o);function a(e){const t=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:a(e.components),i.createElement(s.Provider,{value:t},e.children)}},8886:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>r,contentTitle:()=>c,default:()=>l,frontMatter:()=>a,metadata:()=>i,toc:()=>u});const i=JSON.parse('{"id":"contribute/documentation","title":"Documentation","description":"This site was generated from the contents of your documentation folder using Docusaurus and we host it on GitHub Pages.","source":"@site/docs/contribute/03-documentation.md","sourceDirName":"contribute","slug":"/contribute/documentation","permalink":"/template-fastapi-react/docs/contribute/documentation","draft":false,"unlisted":false,"editUrl":"https://github.com/equinor/template-fastapi-react/tree/main/documentation/docs/contribute/03-documentation.md","tags":[],"version":"current","sidebarPosition":3,"frontMatter":{},"sidebar":"contribute","previous":{"title":"Publishing","permalink":"/template-fastapi-react/docs/contribute/development-guide/publishing"}}');var o=n(4848),s=n(8453);const a={},c="Documentation",r={},u=[{value:"How it works",id:"how-it-works",level:2},{value:"Publishing",id:"publishing",level:2},{value:"Initial settings",id:"initial-settings",level:2},{value:"Assets",id:"assets",level:2}];function d(e){const t={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",header:"header",p:"p",...(0,s.R)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(t.header,{children:(0,o.jsx)(t.h1,{id:"documentation",children:"Documentation"})}),"\n",(0,o.jsxs)(t.p,{children:["This site was generated from the contents of your ",(0,o.jsx)(t.code,{children:"documentation"})," folder using ",(0,o.jsx)(t.a,{href:"https://docusaurus.io/",children:"Docusaurus"})," and we host it on GitHub Pages."]}),"\n",(0,o.jsx)(t.h2,{id:"how-it-works",children:"How it works"}),"\n",(0,o.jsx)(t.p,{children:"From Docusaurus own documentation:"}),"\n",(0,o.jsxs)(t.blockquote,{children:["\n",(0,o.jsx)(t.p,{children:"Docusaurus is a static-site generator. It builds a single-page application with fast client-side navigation, leveraging the full power of React to make your site interactive. It provides out-of-the-box documentation features but can be used to create any kind of site (personal website, product, blog, marketing landing pages, etc)."}),"\n"]}),"\n",(0,o.jsxs)(t.p,{children:["While Docusaurus is rich on features, we use it mostly to host markdown pages. The main bulk of the documentation is located in ",(0,o.jsx)(t.code,{children:"documentation/docs"}),"."]}),"\n",(0,o.jsx)(t.h2,{id:"publishing",children:"Publishing"}),"\n",(0,o.jsxs)(t.p,{children:["We are using the Github Action ",(0,o.jsx)(t.a,{href:"https://github.com/equinor/template-fastapi-react/blob/main/.github/workflows/publish-docs.yaml",children:(0,o.jsx)(t.code,{children:"publish-docs.yaml"})})," to build and publish the documentation website. This action is run every time someone pushes to the ",(0,o.jsx)(t.code,{children:"main"})," branch."]}),"\n",(0,o.jsxs)(t.p,{children:["This will checkout the code, download the changelog from the ",(0,o.jsx)(t.code,{children:"generate-changelog.yaml"})," action, and build the documentation. Then it will deploy the documentation (placed in the documentation/build/ folder) to GitHub Pages."]}),"\n",(0,o.jsx)(t.h2,{id:"initial-settings",children:"Initial settings"}),"\n",(0,o.jsx)(t.p,{children:"When deployed to GitHub Pages, you do need to configure your site under the settings. Pick the gh-pages branch and select either a private url or a public one. It will show you the site\u2019s url, which should now contain your generated documentation site."}),"\n",(0,o.jsx)(t.h2,{id:"assets",children:"Assets"}),"\n",(0,o.jsxs)(t.p,{children:["All assets files are places under ",(0,o.jsx)(t.code,{children:"documentation/static"})]})]})}function l(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,o.jsx)(t,{...e,children:(0,o.jsx)(d,{...e})}):d(e)}}}]);