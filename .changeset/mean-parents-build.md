---
"@sophys-web/widgets": minor
---

Fixed parsing literals for AnyForm component and createSchema helper function. Accounting for the cases:

- "typing.Optional[typing.Literal['option1', 'option2']]"
- "typing.Literal['option1', 'option2']"
- "Optional[Literal['option1', 'option2']]"
- "typing.Optional[list[typing.Literal['option1', 'option2']]]"
