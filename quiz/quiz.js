const PURCHASE_URL = 'https://pay.kiwify.com.br/xUblKOv';

const progressFill  = document.getElementById('progress-fill');
const progressStep  = document.getElementById('progress-step');
const progressTotal = document.getElementById('progress-total');
const quizStage     = document.getElementById('quiz-stage');
const resultStage   = document.getElementById('result-stage');

const questions = [
  { emoji: '🍞', text: 'Você tem dificuldade de encontrar um pão sem glúten saboroso?', sub: 'Escolha a opção que mais combina com você', options: ['Sim, sempre fica seco e sem gosto','Sim, e os de mercado são muito caros','Faço em casa, mas nunca fica bom','Ainda não tentei, mas quero aprender'] },
  { emoji: '💛', text: 'Por que você evita o glúten na sua alimentação?', sub: 'Pode ser mais de um motivo — escolha o principal', options: ['Tenho doença celíaca diagnosticada','Tenho intolerância ou sensibilidade','Opção mais saudável para mim','Alguém da família precisa evitar glúten'] },
  { emoji: '🔥', text: 'Com que frequência você cozinha ou quer cozinhar em casa?', sub: 'Seja honesta — isso nos ajuda a personalizar', options: ['Todo dia ou quase todo dia','Nos fins de semana','Poucas vezes, mas quero mudar isso','Raramente, estou começando agora'] },
  { emoji: '✨', text: 'Se você tivesse receitas testadas, fáceis e deliciosas, colocaria em prática?', sub: 'Seja sincera', options: ['Com certeza! Já estou procurando isso','Sim, só precisava de um guia confiável','Provavelmente sim','Talvez, depende de como for'] },
  { emoji: '🎁', text: 'Onde posso te enviar um presente especial?', sub: 'Deixe seu melhor e-mail — é gratuito e sem spam', options: [], isEmail: true }
];

let current = 0, selected = null, emailValue = '';

progressTotal.textContent = questions.length;

function renderQuestion() {
  const q = questions[current];
  selected = null;
  progressFill.style.width = (current / questions.length * 100) + '%';
  progressStep.textContent = current + 1;

  let optionsHTML = q.isEmail
    ? `<div class="email-field"><input type="email" id="email-input" placeholder="seuemail@exemplo.com" autocomplete="email" /></div>`
    : `<div class="options">${['A','B','C','D'].slice(0, q.options.length).map((l,i) => `<button class="option-btn" onclick="selectOption(this,${i})"><span class="opt-icon">${l}</span>${q.options[i]}</button>`).join('')}</div>`;

  quizStage.innerHTML = `
    <div class="question-card">
      <span class="question-emoji">${q.emoji}</span>
      <p class="question-text">${q.text}</p>
      <p class="question-sub">${q.sub}</p>
      ${optionsHTML}
      <button class="btn-next" id="btn-next" onclick="advance()">
        ${current < questions.length - 1 ? 'Próxima →' : 'Ver meu resultado 🎉'}
      </button>
    </div>`;

  if (q.isEmail) {
    document.getElementById('email-input').addEventListener('input', function() {
      emailValue = this.value.trim();
      toggleNext(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue));
    });
  }
}

function selectOption(btn, index) {
  document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selected = index;
  toggleNext(true);
}

function toggleNext(show) {
  const btn = document.getElementById('btn-next');
  if (btn) btn.classList.toggle('visible', show);
}

function advance() {
  current++;
  current < questions.length ? renderQuestion() : showResult();
}

function showResult() {
  progressFill.style.width = '100%';
  progressStep.textContent = questions.length;
  quizStage.style.display = 'none';
  resultStage.style.display = 'block';
  if (emailValue) localStorage.setItem('quizEmail', emailValue);

  if (typeof fbq !== 'undefined') {
    fbq('track', 'ViewContent');
  }
}  // ← fecha showResult() aqui

function goToPurchase() {  // ✅ CERTO — fora de showResult()
  if (typeof fbq !== 'undefined') {
    fbq('track', 'InitiateCheckout');
  }
  window.location.href = PURCHASE_URL;
}
renderQuestion();