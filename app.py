import streamlit as st
import requests
import json
import time
from datetime import datetime
import os
import pandas as pd

# Configurar página
st.set_page_config(
    page_title="Krioh Agência - Assistente Virtual",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Aplicar estilos CSS para uma interface mais limpa
st.markdown("""
    <style>
    .main {
        background-color: #f8f9fa;
    }
    .stTextArea textarea {
        font-size: 16px;
        border-radius: 10px;
        border: 1px solid #e0e0e0;
        padding: 10px;
    }
    .chat-message {
        padding: 1.5rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
    }
    .user-message {
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        margin-left: 20%;
    }
    .assistant-message {
        background-color: #f0f7ff;
        border: 1px solid #d0e3ff;
        margin-right: 20%;
    }
    .message-header {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    .message-content {
        font-size: 16px;
        line-height: 1.5;
    }
    .stButton button {
        border-radius: 20px;
        padding: 0.5rem 1.5rem;
        font-weight: 500;
    }
    </style>
""", unsafe_allow_html=True)

# Função para carregar o histórico de conversas
def load_chat_history():
    if os.path.exists('chat_history.json'):
        with open('chat_history.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# Função para salvar o histórico de conversas
def save_chat_history(history):
    with open('chat_history.json', 'w', encoding='utf-8') as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

# Inicializar estado da sessão
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = load_chat_history()

# Sidebar com informações da agência
with st.sidebar:
    st.image("https://via.placeholder.com/150x50?text=Krioh+Agência", width=150)
    st.markdown("### 🤖 Assistente Virtual")
    st.markdown("""
    Este assistente está treinado para ajudar com:
    - 📊 Estratégias de Marketing
    - 💡 Ideias Criativas
    - 📱 Gestão de Redes Sociais
    - 📈 Análise de Performance
    - 📝 Copywriting
    """)
    
    st.markdown("---")
    
    if st.button("🗑️ Limpar Conversa", use_container_width=True):
        st.session_state.chat_history = []
        save_chat_history([])
        st.rerun()

# Área principal
st.title("Krioh Agência - Assistente Virtual")

# Container para o histórico de mensagens
chat_container = st.container()

# Exibir histórico de mensagens
with chat_container:
    for message in st.session_state.chat_history:
        with st.container():
            if message["role"] == "user":
                st.markdown(f"""
                    <div class="chat-message user-message">
                        <div class="message-header">
                            <strong>👤 Você</strong>
                            <small style="margin-left: auto; color: #666;">{message['timestamp']}</small>
                        </div>
                        <div class="message-content">{message['content']}</div>
                    </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                    <div class="chat-message assistant-message">
                        <div class="message-header">
                            <strong>🤖 Assistente</strong>
                            <small style="margin-left: auto; color: #666;">{message['timestamp']}</small>
                        </div>
                        <div class="message-content">{message['content']}</div>
                    </div>
                """, unsafe_allow_html=True)

# Área de input
with st.container():
    user_input = st.text_area(
        "Digite sua mensagem:",
        height=100,
        placeholder="Como posso ajudar você hoje?",
        key="user_input"
    )
    
    col1, col2 = st.columns([1, 4])
    with col1:
        submit = st.button("📤 Enviar", use_container_width=True)
    
    if submit and user_input:
        try:
            # Adicionar mensagem do usuário ao histórico
            user_message = {
                "role": "user",
                "content": user_input,
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }
            st.session_state.chat_history.append(user_message)
            
            # Montar o histórico da conversa para o modelo
            historico = ""
            for msg in st.session_state.chat_history:
                if msg["role"] == "user":
                    historico += f"Usuário: {msg['content']}\n"
                else:
                    historico += f"Assistente: {msg['content']}\n"

            # Prompt do sistema reforçando o idioma e contexto
            system_prompt = (
                "Você é um assistente virtual especializado em marketing digital e publicidade para a Krioh Agência. "
                "Sempre responda em português, de forma profissional, criativa e focada em resultados. "
                "Mantenha o contexto da conversa e seja objetivo.\n"
            )

            # Preparar a requisição para o Ollama
            url = "http://localhost:11434/api/generate"
            payload = {
                "model": "mistral:instruct",
                "prompt": f"{system_prompt}{historico}\nUsuário: {user_input}\nAssistente:",
                "stream": True,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 200
                }
            }
            
            # Criar um container para a resposta
            response_container = st.container()
            with response_container:
                message_placeholder = st.empty()
                full_response = ""
                
                # Fazer a chamada para o Ollama com streaming
                with st.spinner("Pensando..."):
                    response = requests.post(url, json=payload, stream=True)
                    
                    if response.status_code == 200:
                        for line in response.iter_lines():
                            if line:
                                json_response = json.loads(line)
                                if 'response' in json_response:
                                    chunk = json_response['response']
                                    full_response += chunk
                                    message_placeholder.markdown(full_response + "▌")
                        
                        # Atualizar uma última vez sem o cursor
                        message_placeholder.markdown(full_response)
                        
                        # Adicionar resposta ao histórico
                        assistant_message = {
                            "role": "assistant",
                            "content": full_response,
                            "timestamp": datetime.now().strftime("%H:%M:%S")
                        }
                        st.session_state.chat_history.append(assistant_message)
                        
                        # Salvar histórico atualizado
                        save_chat_history(st.session_state.chat_history)
                        
                        # Limpar input (removido para evitar erro)
                        # st.session_state.user_input = ""
                        st.rerun()
                    else:
                        st.error(f"Erro na chamada da API: {response.status_code}")
        
        except Exception as e:
            st.error(f"Ocorreu um erro: {str(e)}")

# Rodapé
st.markdown("---")
st.markdown("Desenvolvido para Krioh Agência 🚀") 