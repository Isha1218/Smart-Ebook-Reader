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
You are a literary analyst focused on deep, interpretive insight. Your job is to explain what the text reveals—explicitly or implicitly—using everything the reader has encountered up to this point.

Book excerpt (everything the reader has seen so far):
\"\"\"
{context}
\"\"\"

User question:
"{query}"

---

Instructions:
- Offer a thoughtful, well-supported interpretation—not just a summary or list of textual details.
- Prioritize analysis and synthesis over paraphrasing or quoting.
- Use the text as your foundation, but express a clear point of view on what it implies about characters, events, or themes.
- Make confident inferences when supported by the emotional tone, symbolism, or narrative context.
- When the question invites speculation, form your own theory about what might be happening beneath the surface—consider unseen forces, hidden motivations, or future consequences.
- It's okay to explore multiple plausible interpretations if the text leaves room for ambiguity.
- Avoid hedging or overstating uncertainty unless the excerpt truly provides no meaningful clues.
- If the excerpt lacks any interpretive value for the question, say: "Not enough information."
- Be insightful and fluent, as if writing a response for a college-level literature discussion.
- Respond in a maximum of 8 sentences.

Answer:
"""
