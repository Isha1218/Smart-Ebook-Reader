from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import google.generativeai as genai
from langchain_core.prompts import ChatPromptTemplate
from prompt_templates import FASTLOOKUP_TEMPLATE, RECAP_TEMPLATE, OPEN_ENDED_TEMPLATE
from consts import APIKEY

class FastLookup:
    def __init__(self):
        genai.configure(api_key=APIKEY)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=500,
            length_function=len,
            add_start_index=True
        )
        self.embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    def get_open_ended_res(self, query, previous_read, current_page_text):
        prompt_template_open_ended = ChatPromptTemplate.from_template(OPEN_ENDED_TEMPLATE)
        prompt_open_ended = prompt_template_open_ended.format(context=previous_read, query=query, current_page_text=current_page_text)
        print('this is the current page ' + current_page_text)
        response_open_ended = self.model.generate_content(
                prompt_open_ended,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.75,
                    max_output_tokens=250,
                )
            )
        return response_open_ended.text
        

    def get_lookup_res(self, query, previous_read):
        chunks = self.text_splitter.split_text(previous_read)
        db = FAISS.from_texts(texts=chunks, embedding=self.embedding)
        results = db.similarity_search_with_score(query, k=10)
        context = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
        prompt_template = ChatPromptTemplate.from_template(FASTLOOKUP_TEMPLATE)
        prompt = prompt_template.format(context=context, query=query)

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.5,
                    max_output_tokens=150,
                )
            )
            output_text = response.text
            print(output_text)
            return output_text
        except Exception as e:
            print(f"An error occurred during Gemini API call: {e}")
            return "Error: Could not retrieve a response from the model."
        
    def get_recap(self, recap_text):
        prompt_template = ChatPromptTemplate.from_template(RECAP_TEMPLATE)
        prompt = prompt_template.format(recap_text=recap_text)
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.5,
                    max_output_tokens=500,
                )
            )
            output_text = response.text
            print(output_text)
            return output_text
        except Exception as e:
            print(f"An error occurred during Gemini API call: {e}")
            return "Error: Could not retrieve a response from the model."

