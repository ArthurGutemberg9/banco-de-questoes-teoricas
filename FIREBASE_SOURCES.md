# Fontes oficiais consultadas

- [Adicionar Firebase a um projeto JavaScript](https://firebase.google.com/docs/web/setup): requer criar um projeto Firebase e registrar o app Web para obter o objeto de configuração; descreve o SDK JavaScript modular instalado via npm e a inicialização com `initializeApp`.
- [Autenticação anônima Web](https://firebase.google.com/docs/auth/web/anonymous-auth): o provedor Anônimo precisa ser habilitado no Firebase Console; `signInAnonymously` autentica o cliente para uso com regras de segurança.
- [Condições das regras do Firestore](https://firebase.google.com/docs/firestore/security/rules-conditions): regras podem validar identidade via `request.auth.uid`; regras não funcionam como filtros, portanto a consulta do app também filtra por `ownerUid`.

Essas fontes fundamentam o fluxo de configuração e o modelo de autorização documentados no README. Nenhuma configuração ou credencial de um projeto Firebase real foi fornecida nesta atividade ainda.
