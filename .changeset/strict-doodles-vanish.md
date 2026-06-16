---
"@sophys-web/ui": patch
---

Fixed cumulative increment in accordion content height on status change. The AccordionContent height increasingly grows on successive status changes (open/closed). This behavior is fixed by removing h-(--radix-accordion-content-height) class, to allow the div to grow to the height of its content.
