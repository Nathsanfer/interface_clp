<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', { autoConnect: false })

const opcConectado = ref(false)
const contPecasVermelhas = ref(0)
const contPecasVerdes = ref(0)
const contPecasAmarelas = ref(0)
const contPecasTotal = ref(0)

const colors = computed(() => [
  { name: 'Verde', label: 'Verdes', amount: contPecasVerdes.value, color: '#218b63' },
  { name: 'Amarelo', label: 'Amarelas', amount: contPecasAmarelas.value, color: '#d19a1d' },
  { name: 'Vermelho', label: 'Vermelhas', amount: contPecasVermelhas.value, color: '#d6453a' },
])

const total = computed(() => contPecasTotal.value)

function atualizarDados(dados) {
  contPecasVermelhas.value = dados.contPecasVermelhas
  contPecasVerdes.value = dados.contPecasVerdes
  contPecasAmarelas.value = dados.contPecasAmarelas
  contPecasTotal.value = dados.contPecasTotal
}

onMounted(() => {
  socket.on('opcStatus', status => { opcConectado.value = status })
  socket.on('dadosProducao', atualizarDados)
  socket.on('disconnect', () => { opcConectado.value = false })
  socket.connect()
})

onUnmounted(() => {
  socket.off('opcStatus')
  socket.off('dadosProducao', atualizarDados)
  socket.off('disconnect')
  socket.disconnect()
})
</script>

<template>
  <div class="app-shell">

    <main>
      <section class="page-heading">
        <div>
          <p class="eyebrow">LINHA DE TRIAGEM <span>•</span> VISÃO GERAL</p>
          <h1>Painel de separação por cores</h1>
          <p class="heading-subtitle">Acompanhamento das peças identificadas por cor pela automação.</p>
        </div>
        <div class="controller-summary">
  <span class="connection-badge" :class="{ offline: !opcConectado }">
    <span class="connection-pulse" aria-hidden="true"></span>
    {{ opcConectado ? 'CLP Conectado' : 'CLP Desconectado' }}
  </span>
  <small>Siemens S7-1500 <i>·</i> OPC UA</small>
</div>
      </section>

      <section class="project-card" aria-labelledby="project-title">
        <div class="project-copy">
          <div class="section-label"><span class="label-bar"></span> SOBRE O PROJETO</div>
          <h2 id="project-title">Automação da separação de peças por cor</h2>
          <p>
            O CLP desenvolvido para modernizar a linha integra sensores ópticos e atuadores à triagem de
            peças verdes, amarelas e vermelhas, com apoio de um robô para o direcionamento automatizado.
            O monitoramento ajuda a identificar leituras imprecisas e falhas de sincronismo que podem causar
            desvios na classificação e paradas na produção.
          </p>
        </div>
        <div class="project-goal">
          <span class="goal-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 3 4.5 6v5.5c0 4.7 3.2 7.8 7.5 9.5 4.3-1.7 7.5-4.8 7.5-9.5V6L12 3Z" />
              <path d="m8.5 12 2.2 2.2 4.8-4.8" />
            </svg>
          </span>
          <div>
            <strong>Mais precisão na classificação</strong>
            <p>Monitoramento para reduzir desvios por cor e paradas na linha.</p>
          </div>
        </div>
      </section>

      <section class="materials-section" aria-labelledby="colors-title">
        <div class="section-heading">
          <div>
            <h2 id="colors-title">Peças identificadas</h2>
            <p>Contagem por cor</p>
          </div>
          <span class="live-label"><span></span> DADOS DA AUTOMAÇÃO</span>
        </div>

        <div class="material-grid">
          <article v-for="item in colors" :key="item.name" class="material-card"
            :style="{ '--material-color': item.color }">
            <div class="material-card-top">
              <span class="material-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 3 4.5 7.2v9.6L12 21l7.5-4.2V7.2L12 3Z" />
                  <path d="M12 12 4.5 7.2M12 12l7.5-4.8M12 12v9" />
                </svg>
              </span>
              <span class="material-tag">SEPARADO</span>
            </div>
            <div class="material-amount">{{ String(item.amount).padStart(2, '0') }}</div>
            <div class="material-name">Peças <strong>{{ item.label }}</strong></div>
            <span class="material-accent" aria-hidden="true"></span>
          </article>
        </div>
      </section>

      <section class="insights-grid">
        <article class="distribution-card">
          <div class="distribution-heading">
            <div>
              <h2>Resumo da separação</h2>
              <p>Distribuição das peças identificadas por cor</p>
            </div>
            <div class="total-count">
              <strong>{{ String(total).padStart(2, '0') }}</strong>
              <span>UNIDADES</span>
            </div>
          </div>
          <div class="distribution-bar" role="img" aria-label="Distribuição das peças nas três cores">
            <span v-for="item in colors" :key="item.name"
              :style="{ '--material-color': item.color, flex: item.amount }"></span>
          </div>
          <div class="distribution-legend">
            <span v-for="item in colors" :key="item.name">
              <i :style="{ backgroundColor: item.color }"></i>{{ item.name }}
            </span>
          </div>
        </article>

        <article class="status-card" aria-label="Comunicação com o CLP">
          <span class="communication-state" :class="{ offline: !opcConectado }">
  <i aria-hidden="true"></i>
  {{ opcConectado ? 'Recebendo dados' : 'Sem comunicação' }}
</span>
        </article>
      </section>
    </main>

    <footer class="page-footer">
      <span>Faculdade de Tecnologia Senai Roberto Mange <b>·</b> Campinas, SP</span>
      <span>Kauan Magalhães Piacente <b>·</b> Nathalia Santos Ferreira</span>
    </footer>
  </div>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  background: #f3f6f4;
  color: #17231e;
}

:global(button),
:global(a) {
  font: inherit;
}

.app-shell {
  width: min(1120px, calc(100% - 64px));
  margin: 0 auto;
  padding: 27px 0 25px;
}

.topbar {
  display: flex;
  justify-content: flex-start;
  padding-bottom: 12px;
  border-bottom: 1px solid #e1e8e3;
  color: #78857e;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1px;
}

.topbar i,
.controller-summary i,
.communication-summary p i {
  color: #39a372;
  font-style: normal;
}

.connection-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #d5e8dc;
  border-radius: 999px;
  background: #f7fcf8;
  color: #286647;
  font-size: 12px;
  font-weight: 500;
}

.connection-pulse,
.live-label span {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #20a268;
}

.connection-pulse {
  box-shadow: 0 0 0 3px #def1e5;
}

.controller-summary {
  display: grid;
  justify-items: end;
  gap: 7px;
}

.controller-summary small {
  color: #829087;
  font-size: 10px;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin: 27px 0 20px;
}

.eyebrow,
.section-label {
  color: #718078;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.2px;
}

.eyebrow {
  margin: 0 0 7px;
}

.eyebrow span {
  padding: 0 5px;
  color: #33a06c;
}

.page-heading h1 {
  margin: 0;
  font-size: clamp(24px, 3vw, 29px);
  font-weight: 600;
  letter-spacing: -0.9px;
  line-height: 1.2;
}

.heading-subtitle {
  margin: 7px 0 0;
  color: #78857e;
  font-size: 13px;
}

.project-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  align-items: center;
  gap: 25px;
  padding: 17px 20px;
  border: 1px solid #dfe8e2;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 14px rgb(34 62 47 / 3%);
}

.section-label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #438565;
  font-size: 9px;
}

.label-bar {
  width: 14px;
  height: 2px;
  border-radius: 2px;
  background: #38a771;
}

.project-copy h2 {
  margin: 7px 0 5px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.25px;
}

.project-copy p {
  max-width: 730px;
  margin: 0;
  color: #6d7a72;
  font-size: 11px;
  line-height: 1.6;
}

.project-goal {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 9px;
  background: #f2f8f4;
}

.goal-icon {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 9px;
  background: #e1f0e7;
  color: #218558;
}

.goal-icon svg {
  width: 18px;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.project-goal strong {
  display: block;
  margin: 1px 0 4px;
  font-size: 11px;
  font-weight: 600;
}

.project-goal p {
  margin: 0;
  color: #718078;
  font-size: 10px;
  line-height: 1.5;
}

.materials-section {
  margin-top: 30px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-heading h2,
.distribution-heading h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.25px;
}

.section-heading p,
.distribution-heading p {
  margin: 3px 0 0;
  color: #849087;
  font-size: 10px;
}

.live-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #78867d;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.7px;
}

.live-label span {
  width: 6px;
  height: 6px;
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.material-card {
  position: relative;
  overflow: hidden;
  min-height: 184px;
  padding: 20px 22px 22px;
  border: 1px solid #e2e8e4;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 3px 12px rgb(34 62 47 / 2%);
}

.material-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.material-icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 11px;
  background: color-mix(in srgb, var(--material-color) 11%, white);
  color: var(--material-color);
}

.material-icon svg {
  width: 23px;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.material-tag {
  color: #9aa59e;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.65px;
}

.material-amount {
  margin-top: 17px;
  font-family: Arial, sans-serif;
  font-size: 50px;
  font-weight: 500;
  letter-spacing: -1.5px;
  line-height: 1;
}

.material-name {
  margin-top: 9px;
  color: #7d8981;
  font-size: 13px;
}

.material-name strong {
  color: #35433a;
  font-weight: 600;
}

.material-accent {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--material-color);
  opacity: 0.78;
}

.insights-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 13px;
  margin-top: 15px;
}

.distribution-card,
.status-card {
  min-height: 132px;
  padding: 15px 17px;
  border: 1px solid #e2e8e4;
  border-radius: 11px;
  background: #fff;
  box-shadow: 0 3px 12px rgb(34 62 47 / 2%);
}

.distribution-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.distribution-heading h2,
.status-card h2 {
  font-size: 13px;
}

.distribution-heading p {
  font-size: 9px;
}

.total-count {
  display: grid;
  gap: 1px;
  text-align: right;
}

.total-count strong {
  font-family: Arial, sans-serif;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -1px;
  line-height: 1;
}

.total-count span {
  color: #89958d;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.7px;
}

.distribution-bar {
  display: flex;
  overflow: hidden;
  height: 7px;
  margin-top: 15px;
  border-radius: 8px;
  background: #edf1ee;
}

.distribution-bar span {
  background: var(--material-color);
}

.distribution-legend {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 11px;
}

.distribution-legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #647269;
  font-size: 9px;
}

.distribution-legend i {
  width: 7px;
  height: 7px;
  border-radius: 2px;
}

.communication-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.status-card h2 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}

.communication-summary p {
  margin: 5px 0 0;
  color: #849087;
  font-size: 10px;
}

.communication-state {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #258257;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
}

.communication-state i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #20a268;
  box-shadow: 0 0 0 3px #e1f2e8;
}

.page-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 17px;
  color: #87938b;
  font-size: 9px;
}

.page-footer b {
  padding: 0 4px;
  color: #bac4bd;
}

.connection-badge.offline {
  border-color: #f0d0cb;
  background: #fdf6f5;
  color: #a63d2f;
}

.connection-badge.offline .connection-pulse {
  background: #d85342;
  box-shadow: 0 0 0 3px #f6dcd8;
}

.communication-state.offline {
  color: #a63d2f;
}

.communication-state.offline i {
  background: #d85342;
  box-shadow: 0 0 0 3px #f6dcd8;
}

@media (max-width: 760px) {
  .app-shell {
    width: min(100% - 36px, 620px);
    padding-top: 20px;
  }

  .project-card {
    grid-template-columns: 1fr;
    gap: 13px;
  }

  .project-goal {
    align-items: center;
  }

  .material-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .distribution-card,
  .status-card {
    min-height: auto;
  }
}

@media (max-width: 480px) {
  .app-shell {
    width: calc(100% - 28px);
    padding-top: 16px;
  }

  .topbar {
    padding-bottom: 16px;
  }

  .connection-badge {
    gap: 7px;
    padding: 7px 9px;
    font-size: 10px;
  }

  .page-heading {
    align-items: flex-start;
    margin: 22px 0 16px;
  }

  .page-heading h1 {
    font-size: 23px;
  }

  .heading-subtitle {
    max-width: 240px;
    font-size: 11px;
    line-height: 1.5;
  }

  .controller-summary {
    gap: 6px;
  }

  .controller-summary small {
    font-size: 8px;
    text-align: right;
    white-space: nowrap;
  }

  .project-card {
    padding: 14px;
  }

  .project-copy p {
    font-size: 10px;
  }

  .section-heading {
    align-items: flex-end;
  }

  .live-label {
    font-size: 7px;
  }

  .material-grid {
    gap: 12px;
  }

  .material-card {
    min-height: 158px;
    padding: 15px;
  }

  .material-icon {
    width: 34px;
    height: 34px;
  }

  .material-icon svg {
    width: 20px;
  }

  .material-amount {
    margin-top: 13px;
    font-size: 42px;
  }

  .material-name {
    margin-top: 7px;
    font-size: 11px;
  }

  .distribution-legend {
    flex-wrap: wrap;
    justify-content: flex-start;
    column-gap: 13px;
  }

  .communication-summary {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .page-footer {
    flex-direction: column;
    gap: 5px;
    line-height: 1.5;
  }
}
</style>
