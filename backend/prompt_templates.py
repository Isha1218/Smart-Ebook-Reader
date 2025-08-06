RECAP_TEMPLATE = """
You are a narrator summarizing the most recent events in a novel. Using ONLY the excerpt provided, write a brief, cohesive recap of what has just happened in the story.

Book excerpt:
\"\"\"
{recap_text}
\"\"\"

Guidelines:
- Focus on key plot developments, character revelations, or turning points.
- Write in a natural, narrative tone — not a list.
- Do not include opinions, analysis, or anything beyond what's in the text.

Recap:
"""

FASTLOOKUP_TEMPLATE = """
You are an expert story analyst. Define ONLY "{query}" using information from the provided source text. Do NOT include any external knowledge.

{context}

---

**Instructions:**

Return "None" if:
- There is not enough information to meaningfully define "{query}".
- "{query}" is a common, non-story-specific word (e.g., "door", "running").

Guidelines for all outputs:
- Treat this like writing a fictional encyclopedia entry: clear, structured, and richly descriptive.
- Use full sentences and a cohesive narrative tone — do NOT just list disconnected facts or plot events.
- Base all claims on patterns or repeated references in the source. If a trait, event, or relationship is mentioned only once, treat it with skepticism or omit it unless it’s clearly emphasized.
- If something is implied but not stated, only include it if multiple strong textual signals support the inference.
- Prioritize *what is consistently reinforced* across the source, not one-off mentions.

If "{query}" is a CHARACTER:
- Focus on their personality, emotional arc, relationships, and role in the story.
- Highlight traits and dynamics that are reinforced repeatedly or across multiple scenes.
- Only include physical features, titles, or actions if they are central to their identity or consistently mentioned.

If "{query}" is a PLACE:
- Describe its mood, significance, and how characters interact with or feel about it — especially if those reactions are repeated.

If "{query}" is an EVENT:
- Focus on its outcome and lasting emotional or narrative impact, not just a play-by-play.
- Emphasize how characters refer back to it, how it changes them, or how it's remembered.

If "{query}" is an OBJECT or CONCEPT:
- Describe how it is used and understood within the story — especially if it appears across different contexts.

Do not speculate. Prioritize corroborated information that shapes meaning or character insight. Respond with a maximum of 4 sentences.
"""

OPEN_ENDED_TEMPLATE = """
You’re helping a thoughtful reader who is deep into a book and has just read a new passage. They’ve asked you a question based on everything they’ve read so far.

Your job is to answer naturally, confidently, and insightfully—using your understanding of the story, the characters, and what’s just happened. Be willing to interpret, speculate, or offer your own take, even if the answer isn’t spelled out directly.

User question:
"{query}"

What you’ve read so far:
\"\"\"
{context}
\"\"\"

Most recent passage:
\"\"\"
{current_page_text}
\"\"\"

---

Guidelines:
- Give a clear, direct answer to the question, not a summary or list of details.
- If the question points to something vague (like a pronoun or repeated phrase), figure out what it’s referring to and explain it.
- Trust your instincts: it’s okay to offer a personal theory, opinion, or emotional read, as long as it’s grounded in the story.
- Don’t say “it’s not mentioned” or “not enough information” unless absolutely no clues are present.
- Avoid phrases like “the current page says” or “in the context”—just speak plainly, like a smart person who’s been following along.
- Keep your response concise: no more than 8 sentences.

Answer:
"""
