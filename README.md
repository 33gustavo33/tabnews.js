<div align="center">
    <h1>Tabnews.js  <img src="https://visitor-badge.glitch.me/badge?page_id=tabnews.jsbega" /></h1>
    <img src="https://img.shields.io/badge/version-v1.1.0-blue?style=for-the-badge" />
    <img src="https://img.shields.io/github/license/33gustavo33/tabnews.js?style=for-the-badge" />
    <img src="http://img.shields.io/static/v1?label=STATUS&message=DESENVOLVIMENTO&color=GREEN&style=for-the-badge" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge" />
</div><br><br
              
Uma biblioteca javascript feita para interagir com a API do [Tabnews](https://tabnews.com.br) 

## Instalação
```sh-session
npm install tabnews.js
yarn add tabnews.js
```
## Exemplo de uso
```js
import { Client } from "tabnews.js"
const client = new Client()

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
Alerta: recomendo expandir tudo caso for ler as docs!
<details><summary><h2>Classe Client(clique para expandir)</h2></summary>

## Eventos: [ready](#ready), [destroyed](#destroyed)
## Construtor
O constructor da classe Client aceita 1 parâmetro opcional, que é um objeto de configuração
O objeto de configuração se parece com isso:
|Nome|Descrição|tipo
|--|--|--|
|**tabnewsUrl**|uma url customizada do tabnews.|string, opcional
|**log**|se o client deve usar o logger ou não|boolean, opcional
|**customAgentUser**|um agent user customizado pro client, use o nome do seu projeto aqui!|string, opcional
|**debug**|se o client deve usar o modo debug ou não(não é recomendado usar)|boolean, opcional

---
## Métodos do client
### Método login
O metódo login aceita 1 parâmetro obrigatório, que é um objeto de login.
O objeto de login se parece com isso:
|Nome|Descrição|tipo
|--|--|--|
|**email**|o email da conta|string, opcional
|**password**|a senha da conta|string, opcional
|**token**|o token da conta|string, opcional

> **Caso você use um token, você não precisa usar um email e password,
> caso você não use um token, você precisa usar o email e o password**

esse método retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um [ClientUserData](#clientuserdata), ele também emite o evento [ready](#ready)

### Método destroy
Este método destroi a conexão do client com a api.
Para você se conectar novamente você tera que usar o método [login](#método-login)
ele também emite o evento [destroyed](#destroyed)

---
## Propriedades do client
Nome|Descrição|tipo
|--|--|--|
|**connected**|se o client está conectado|boolean
|**token**|o token do client|string
|**contents**|um gerenciador de contéudos|[ContentManager](#contentmanager)
|**status**|um gerenciador do status do tabnews|[StatusManager](#statusmanager)
|**users**|um gerenciador de usuários|[UsersManager](#usersmanager)
|**user**|um gerenciador do usuário do client|[UserManager](#usermanager)

Vale lembrar que as propriedades `contents`, `status`, `users`, `user` só estão disponiveis após o login do bot!

---

## ContentManager
Um content manager, como o nome já diz é responsavel por gerenciar os conteudos.
Através dele você vai consegur publicar, deletar, editar, dar upvote/downvote em conteúdos, obter os conteúdos relevantes, etc... <br>
A seguir estão os metodos de um ContentManager
### Método get
O método get obtém um conteudo com base em 2 parâmetros obrigatórios, sendo eles `author` e `slug`. <br>
Exemplo: se o author for igual a `Gustavo33` e o slug for `tabnews-js-uma-biblioteca-javascript-para-interagir-com-a-api-do-tabnews` o contéudo que ele vai obter vai ser: 
`https://www.tabnews.com.br/Gustavo33/tabnews-js-uma-biblioteca-javascript-para-interagir-com-a-api-do-tabnews`
Esse método retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um [Content](#content)
### Método getContents
Este método obtém os contéudos mais novos, mais antigos, e mais relevantes com base no primeiro parâmetro. o segundo parâmetro é a página que ele vai obter os conteúdos(Cada página tem 30 conteúdos)
Pârametros:
|Nome|Valores|obrigatório|
|--|--|--|
|strategy|`"new"` - `"old"` - `"relevant"`|Não, o default é `"new"`.
|page|Qualquer número|Não, o default é `1`.

Esse método retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um Array de [Contents](#content).
### Método post
Este método posta um contéudo, ele aceita 1 pârametro obrigatório, que o objeto listado abaixo:
|Nome|Descrição|obrigatório|Efeito
|--|--|--|--|
|parentId|o id de um conteúdo|não obrigatório|faz o conteúdo ser uma resposta ao conteúdo com id igual ao parentId|
|customSlug|um slug customizado|não obrigatório|adiciona um slug customizado|
|title|o título do conteúdo|não obrigatório **caso seja uma resposta**|adiciona um título ao conteúdo|
|body|o corpo do conteúdo, você pode usar markdown aqui nesse campo|obrigatório|adiciona texto ao conteúdo|
|sourceUrl|a url da fonte|não obrigatório|adiciona uma fonte ao conteúdo|

Esse método retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um [Content](#content)
### Método edit
Este método edita um conteúdo, ele aceita 3 pârametros obrigatórios, sendo eles:
|Nome|Descrição|
|--|--|
|author|o autor do conteúdo|
|slug|o slug do conteúdo|
|content|o que vai ser alterado|

o pârametro content é um objeto, as propriedades desse objeto estão listadas abaixo:
|Nome|Descrição|obrigatório|Efeito
|--|--|--|--|
|title|o título do conteúdo|não obrigatório|adiciona um título ao conteúdo|
|body|o corpo do conteúdo, você pode usar markdown aqui nesse campo|não obrigatório|adiciona texto ao conteúdo|
|sourceUrl|a url da fonte|não obrigatório|adiciona uma fonte ao conteúdo|

Esse método retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um [Content](#content)
### Método delete
O método delete deleta um conteudo com base em 2 parâmetros obrigatórios, sendo eles `author` e `slug`. <br>
Exemplo: se o author for igual a `Gustavo33` e o slug for `tabnews-js-uma-biblioteca-javascript-para-interagir-com-a-api-do-tabnews` o contéudo que ele vai deletar vai ser: 
`https://www.tabnews.com.br/Gustavo33/tabnews-js-uma-biblioteca-javascript-para-interagir-com-a-api-do-tabnews`
Esse método retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um [Content](#content)
### Método upvote e downvote
os Métodos upvote e downvote funcionam com base em 2 parâmetros obrigatórios, sendo eles `author` e `slug`. <br>
E com base nesses pârametros ele da um upvote/downvote
Esse método retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um objeto parecido com isso:
|Nome|Descrição|
|--|--|
|tabcoins|O numero de tabcoins que o contéudo ficou depois do upvote/downvote|

### Método watch
o método watch começa a assistir um contéudo, retornando um [Watcher](#classe-watcherclique-para-expandir).
Pârametros:
|Nome|Descrição|obrigatório
|--|--|--|
|author|o autor do conteúdo que ele vai assistir.|sim
|slug|o slug do conteúdo que ele vai assistir.|sim
|observeWhat|em que o watcher deve assistir por mudanças|não, o padrão é ele assistir por todos.
|ms|o tempo que o watcher vai procurar por mudanças(em milisegundos)|não, o padrão é 2 minutos e 5 segundos

---
## UsersManager
Um UsersManager, como o nome já diz é responsavel por gerenciar os usuários.
Através dele você vai consegur obter um usuário, obter os conteúdos relevantes de um usuário, etc... <br>
A seguir estão os metodos de um UsersManager
### Método get
O método get obtém um usuário com base em 1 parâmetro obrigatório, sendo ele `username`. <br>
Exemplo: se o username for `Gustavo33`, o usuário que ele vai obter vai ser: 
`https://www.tabnews.com.br/Gustavo33`
Esse método retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um [UserData](#userdata)
### Método getContentsOfUser
Este método obtém os contéudos mais novos, mais antigos, e mais relevantes de um usuário com base no primeiro e segundo parâmetro. o terceiro parâmetro é a página que ele vai obter os conteúdos(Cada página tem 30 conteúdos)
Pârametros:
|Nome|Valores|obrigatório|
|--|--|--|
|username|Nome do usuário que você quer obter|Sim
|strategy|`"new"` - `"old"` - `"relevant"`|Não, o default é `"new"`.
|page|Qualquer número|Não, o default é `1`.

Esse método retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um Array de [Contents](#content).

### Método watch
o método watch começa a assistir um usuário, retornando um [Watcher](#classe-watcherclique-para-expandir).
Pârametros:
|Nome|Descrição|obrigatório
|--|--|--|
|username|o username do usuário que ele vai assistir.|sim
|observeWhat|em que o watcher deve assistir por mudanças|não, o padrão é ele assistir por todos.
|ms|o tempo que o watcher vai procurar por mudanças(em milisegundos)|não, o padrão é 2 minutos e 5 segundos
---
## UserManager
Um UserManager, é responsavel por gerenciar o usuário do client.
Através dele você vai consegur obter o usuário do client, editar o usuário do client, etc... <br>
A seguir estão os metodos e propriedades de um UserManager
### Método get
O método get atualiza o usuário do Client.
Esse método retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um [ClientUserData](#clientuserdata)
### Método edit
Este método edita o usuário do client, ele aceita 1 pârametro que é um objeto, o objeto se parece com isso:
|Nome|Descrição|
|--|--|
|username|o username do usuário|

Esse método retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um [ClientUserData](#clientuserdata)

### Método watch
o método watch começa a assistir o usuário do client, retornando um [Watcher](#classe-watcherclique-para-expandir).
Pârametros:
|Nome|Descrição|obrigatório
|--|--|--|
|observeWhat|em que o watcher deve assistir por mudanças|não, o padrão é ele assistir por todos.
|ms|o tempo que o watcher vai procurar por mudanças(em milisegundos)|não, o padrão é 2 minutos e 5 segundos

### Propriedades de um UserManager
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

---
## StatusManager
Um StatusManager, é responsavel por gerenciar o status do tabnews
Através dele você vai obter o status do tabnews. <br>
### Método get
o método get obtém o [status do tabnews](https://www.tabnews.com.br/status).
Esse método retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um [Status]()
</details>
<details><summary><h2>Classe Watcher(clique para expandir)</h2></summary>

Um Watcher, é uma classe que assiste por mudanças um Conteúdo/Usuário.<br>
Todos os Watchers são iguais, a única coisa que muda é o que ele assiste. <br>
Eventos do watcher: [watcherUpdate](#watcherupdate)
## Métodos de um watcher
### Método start
o método start inicia o watcher, e faz ele começar a assistir o Conteúdo/usuário.
### Método destroy
o método destroy destrói o Watcher, ou seja, para de assistir ao Conteúdo/usuário.
Você pode iniciar novamente o watcher pelo método start.
</details>
<details><summary><h2>Estruturas de dados(clique para expandir)</h2></summary>

# Tipos de informação
## UserData
### Propriedades
|Nome|Descrição|tipo
|--|--|--|
|**id**|o id de um usuário|string
|**username**|o username de um usuário|string
|**features**|as features de um usuário|array
|**tabcoins**|a quantidade de tabcoins de um usuário|number
|**tabcash**|a quantidade de tabcash de um usuário|number
|**created_at**|quando que o usuário foi criado|Date
|**updated_at**|ultima vez que o usuário foi modificado|Date
## ClientUserData
### Propriedades
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
## Content
### Propriedades
|Nome|Descrição|tipo
|--|--|--|
|**id**|o id do conteúdo|string|
|**parent_id**|o id do conteúdo root|string|
|**slug**|o slug do conteúdo|string
|**title**|o título do conteúdo|string
|**body**|o texto do conteúdo|string
|**status**|o status do conteúdo|string
|**source_url**|a fonte do conteúdo|string
|**thumbnail**|a thumbnail do conteúdo|string
|**tabcoins**|o número de tabcoins do conteúdo|number
|**created_at**|data da criação do conteúdo|Date
|**published_at**|data da postagem do conteúdo|Date
|**updated_at**|data de quando o conteúdo foi editado|Date
|**deleted_at**|data de quando o conteúdo foi deletado|Date
|**is_children**|se o conteúdo é uma resposta|boolean
|**is_root**|se o conteúdo é root|boolean
|**has_children**|se o conteúdo tem respostas|boolean
|**owner**|o criador do contéudo|<table>  <thead>  <tr>  <th>Nome</th>  <th>Descrição</th>  <th>Tipo</th>  </tr>  </thead>  <tbody>  <tr>  <td><strong>id</strong></td>  <td>O id do criador</td>  <td>string</td></tr>  </thead>  <tbody>  <tr>  <td><strong>username</strong></td>  <td>O username do criador</td>  <td>string</td>   </tbody>  </table>

### Métodos
#### Método fetchOwner
O método fetchOwner obtém o usuário criador do conteúdo.
Retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um [UserData](#userdata)
#### Método fetchParent
O método fetchParent obtém o conteúdo root do conteúdo atual.
Retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um [Content](#content)
#### Método fetchChildren
O método fetchChildren obtém as respostas do conteúdo atual.
Retorna uma [Promise](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise) contendo um Array de [Content](#content)
</details>

<details><summary><h2>Eventos(clique para expandir)</h2></summary>

Aqui estão os eventos do tabnews.js, você pode escutar eles com:
```js
<client ou watcher>.on("Nome do evento", (data) => {})
```
### Ready
O evento ready é disparado quando o [client](#classe-clientclique-para-expandir) faz login no tabnews, ele traz consigo um [ClientUserData](#clientuserdata)
```js
<client>.on("ready", (clientUserData) => { console.log(clientUserData) })
```
### Destroyed
O evento destroyed é disparado quando o [client](#classe-clientclique-para-expandir) é destruído, ele traz consigo um [ClientUserData](#clientuserdata)
```js
<client>.on("destroyed", (clientUserData) => { console.log(clientUserData) })
```
### WatcherUpdate
o evento watcherUpdate é disparado quando um [Watcher](#watcher) faz um update, ele traz consigo uma informação variada dependendo de o que você está assistindo.
```js
<watcher>.on("watcherUpdate", (data) => { console.log(data) })
```
</details>

# Problemas?
Caso você tenha um problema ou não entenda algo da documentação, não hesite em abrir uma issue ou entrar no [discord do TabNews](https://discord.gg/usQY5vwXer)

<p align="center">
 <picture bottom="10px">
   <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/33gustavo33/33gustavo33/master/tabnews.js-light.png" width="190" height="190">
   <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/33gustavo33/33gustavo33/master/tabnews.js-dark.png" width="190" height="190">
   <img alt="Tabnews.js - Um biblioteca javascript para interagir com o TabNews" src="https://raw.githubusercontent.com/33gustavo33/33gustavo33/master/tabnews.js-dark.png" width="190" height="190">
 </picture>
</p>
