
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import firebase_admin
from firebase_admin import credentials, firestore

class ActionCadastroInfo(Action):
    def name(self) -> Text:
        return "action_cadastro_info"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Initialize Firebase
        if not firebase_admin._apps:
            cred = credentials.Certificate("path/to/serviceAccountKey.json")
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        
        # Get response from Firestore
        responses_ref = db.collection('chatbot_responses')
        query = responses_ref.where('intent', '==', 'cadastro_info').limit(1)
        response_docs = query.get()
        
        if response_docs:
            response = response_docs[0].to_dict().get('response')
            dispatcher.utter_message(text=response)
        else:
            dispatcher.utter_message(text="Para se cadastrar, siga estes passos:\n"
                                   "1. Clique no botão 'Cadastro' no menu principal\n"
                                   "2. Preencha seus dados pessoais\n"
                                   "3. Adicione informações sobre sua propriedade\n"
                                   "4. Envie os documentos necessários")
        return []

class ActionSalvarFormulario(Action):
    def name(self) -> Text:
        return "action_salvar_formulario"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        try:
            # Initialize Firebase if not already initialized
            if not firebase_admin._apps:
                cred = credentials.Certificate("path/to/serviceAccountKey.json")
                firebase_admin.initialize_app(cred)
            
            db = firestore.client()
            
            # Get form data from tracker
            form_data = {
                "nome": tracker.get_slot("nome"),
                "area": tracker.get_slot("area"),
                "tipo_servico": tracker.get_slot("tipo_servico"),
                "data_solicitacao": tracker.get_slot("data")
            }
            
            # Save to Firestore
            db.collection("formularios").add(form_data)
            
            dispatcher.utter_message(text="Seu formulário foi salvo com sucesso!")
        except Exception as e:
            dispatcher.utter_message(text="Desculpe, houve um erro ao salvar seu formulário.")
        
        return []
