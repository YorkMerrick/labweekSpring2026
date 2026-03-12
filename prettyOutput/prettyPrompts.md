# Prompts

### Html prompt

```
I have a weekly engineering digest that I want you to format into a html page with styling keeping the same content outputing in a code block:
```

### Slackbot prompt

```
You will receive a weekly engineering digest as the variable DIGEST below. Format this digest into a Slack‑ready code block following these exact rules:

Preserve all original bullet points exactly as provided — including their indentation, structure, and nested levels. Do NOT alter bullet symbols or spacing.
Indent every bullet point an additional 4 spaces (on top of whatever indentation already exists).
Add emojis ONLY to section headers. Do NOT add emojis anywhere else. Use a variety of emojis.
Add exactly one blank line directly under each section header.
Add double‑line spacing between all major sections.
Do NOT add emojis to lines beginning with Impact, Action, Action Consideration, No Immediate Action, or Context Contact.
Keep all wording, punctuation, capitalization, and content exactly the same. No rewriting, summarising, shortening, or rephrasing.
Where a section contains summarised bullet‑style change lines that are not formatted as bullets, convert those lines into proper bullet points, while preserving the wording exactly.
Do NOT convert lines starting with Impact, Action, Action Consideration, No Immediate Action, or Context Contact into bullet points. Leave their formatting exactly as originally provided.
Output the final formatted digest ONLY as a Slack‑ready code block, with all spacing, indentation, and bullet structures fully preserved.


DIGEST
```
