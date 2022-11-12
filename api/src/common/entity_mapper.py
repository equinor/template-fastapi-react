from typing import Optional, Type

from pydantic import BaseModel


def filter_fields(
    name: Optional[str] = None,
    include: Optional[list[str]] = None,
    exclude: Optional[list[str]] = None,
):
    """Return a decorator to filter model fields"""

    def decorator(cls: Type[BaseModel]):
        config = cls.Config()
        to_include = getattr(config, "include", include)
        to_exclude = getattr(config, "exclude", exclude)

        if name:
            cls.__name__ = name

        include_ = set(cls.__fields__.keys())

        if to_include is not None:
            include_ &= set(to_include)

        exclude_ = set()
        if to_exclude is not None:
            exclude_ = set(to_exclude)
        if to_include and to_exclude and set(to_include) & set(to_exclude):
            raise ValueError("include and exclude cannot contain the same fields")

        for field in list(cls.__fields__):
            if field not in include_ or field in exclude_:
                del cls.__fields__[field]
        return cls

    return decorator
