# tabnews.js

Uma biblioteca javascript para interagir com a API do [Tabnews](https://tabnews.com.br)
## Instalação

```sh-session
npm install tabnews.js
yarn add tabnews.js
```
## Exemplo de uso
```js
const tabnewsJs = require("tabnews.js")
const client = new tabnewsJs.Client()

client.login({
    email: "example@example.com",
    password: "examplePassword",
    //ou então você pode logar direto pelo token, porém o token fica inválido depois de algum tempo.
    token: "token"
}).then((user) => {
    console.log(`Logado na conta ${user.username} com o token ${user.token}`)
}).catch(console.error)
```
# Documentação(Não está pronta.)
## Client
#### Construtor
O constructor da classe Client aceita 1 parâmetro opcional, que é um objeto de configuração
O objeto de configuração se parece com isso:
|Nome|Descrição|tipo
|--|--|--|
|**tabnewsUrl**|uma url customizada do tabnews.|string, opcional
|**log**|se o client deve usar o logger ou não|boolean, opcional
---
### Métodos do client
#### Método login
O metódo login aceita 1 parâmetro obrigatório, que é um objeto de login.
O objeto de login se parece com isso:
|Nome|Descrição|tipo
|--|--|--|
|**email**|o email da conta|string, opcional
|**password**|a senha da conta|string, opcional
|**token**|o token da conta|string, opcional

> **Caso você use um token, você não precisa usar um email e password,
> caso você não use um token, você precisa usar o email e o password**

esse método retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um [ClientUserData](#clientuserdata)

#### Método destroy
Este método destroi a conexão do client com a api.
Para você se conectar novamente você tera que usar o método [login](#método-login)

---
### Propriedades do client
Nome|Descrição|tipo
|--|--|--|
|**connected**|se o client está conectado|boolean
|**token**|o token do client|string

## Tipos de informação
#### UserData
|Nome|Descrição|tipo
|--|--|--|
|**id**|o id de um usuário|string
|**username**|o username de um usuário|string
|**features**|as features de um usuário|array
|**tabcoins**|a quantidade de tabcoins de um usuário|number
|**tabcash**|a quantidade de tabcash de um usuário|number
|**created_at**|quando que o usuário foi criado|Date
|**updated_at**|ultima vez que o usuário foi modificado|Date
#### ClientUserData
|Nome|Descrição|tipo
|--|--|--|
|**email**|o email do client|string
|**token**|o token do client|string
|**id**|o id do client|string
|**username**|o username do client|string
|**features**|as features do client|array
|**tabcoins**|a quantidade de tabcoins do client|number
|**tabcash**|a quantidade de tabcash do client|number
|**created_at**|quando que o client foi criado|Date
|**updated_at**|ultima vez que o client foi modificado|Date
