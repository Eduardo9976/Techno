const vm = new Vue({
  el: '#app',
  data: {
    produtos: [],
    produto: false,
    carrinho: [],
    mensagemAlerta: "Item Adicionado",
    alertaAtivo: false,
    carrinhoAtivo: false
  },
  filters: {
    numeroPreco(valor) {
     return valor.toLocaleString("pt-BR", {style: "currency", currency: "BRL"})
    }
  },
  computed: {
    carrinhoTotal() {
      let total = 0
      if(this.carrinho.length){
        this.carrinho.forEach(item => {
          total += item.preco
        });
      }
      return total
    }
  },
  methods: {
    async fetchProdutos() {
      const response = await fetch('./api/produtos.json');
      const responseJSON = await response.json();
      this.produtos = responseJSON;
    },
    async fetchProduto(id) {
      const response = await fetch(`./api/produtos/${id}/dados.json`);
      const responseJSON = await response.json();
      this.produto = responseJSON
    },
    abrirModal(id) {
      this.fetchProduto(id);
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    },
    fecharModal({target, currentTarget}) {
      if (target === currentTarget){
        this.produto = false
      }
    },
    clickForaCarrinho({target, currentTarget}) {
      if (target === currentTarget){
        this.carrinhoAtivo = false
      }
    },
    adicionarItem() {
      this.produto.estoque--;
      const {id, nome, preco} = this.produto
      this.carrinho.push({id, nome, preco})
      this.alerta(`${nome} foi adicionado ao carrinho.`)
    },
    removerItem(index) {
      // this.produto.estoque++;
      this.alerta(`${this.carrinho[index].nome} removido com sucesso`)
      this.carrinho.splice(index, 1)
    },
    checarLocalStorage() {
      if(window.localStorage.carrinho) {
        this.carrinho = JSON.parse(window.localStorage.carrinho)
      }
    },
    compararEstoque() {
       const items = this.carrinho.filter(({id}) => {
         if(id === this.produto.id) {
          return true
         }
         
       })
       this.produto.estoque = this.produto.estoque - items.length
       console.log(items)
    },
    alerta(mensagem) {
      this.mensagemAlerta = mensagem
      this.alertaAtivo = true
      setTimeout(() => {
        this.alertaAtivo = false
      }, 1500)
    },
    router() {
      const hash = document.location.hash;
      if(hash) {
        this.fetchProduto(hash.replace("#",""))
      }
    }
  },
  watch: {
    produto() {
      document.title = this.produto.nome || "Technno"
      const hash = this.produto.id || ""
      history.pushState(null, null, `#${hash}`)
      if (this.produto) {
        this.compararEstoque()
      }
    },
    carrinho() {
      window.localStorage.carrinho = JSON.stringify(this.carrinho)
    }
  },
  created() {
    this.fetchProdutos()
    this.checarLocalStorage()
    this.router()
  }
})