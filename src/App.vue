<script setup></script>

<template class="app">
  <header>
    <h1 class="title">Interface gráfica dos dados coletados na Automação</h1>
    <div class="badge">
      <div class="tag-color"></div>
      <p class="tag-text">Gênio Conectado</p>
    </div>
  </header>

  <main>
    <section class="content">
      <p></p>
    </section>
  </main>
</template>

<style scoped>

header {
  display: flex;
  margin: 2rem 5rem;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.badge {
  display: flex;
  align-items: center;
  background-color: #D3EFD191;
  padding: 0.5rem 0.8rem;
  border-radius: 1.5rem;
}

.tag-color {
  width: 0.5rem;
  height: 0.5rem;
  background-color: #4CAF50;
  border-radius: 50%;
  margin-right: 0.5rem;
}
</style>
