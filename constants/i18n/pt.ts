import type { Strings } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

export const pt: Strings = {
  tabs: {
    timer: 'Timer',
    guided: 'Guiadas',
    history: 'Histórico',
    settings: 'Ajustes',
  },

  timer: {
    heading: 'Meditar',
    sessionLength: 'Duração da sessão',
    hints: [
      'Comece quando estiver pronto.',
      'Respire fundo uma vez.',
      'Nada precisa acontecer agora.',
      'Este tempo é seu.',
      'Deixe os ombros caírem.',
      'Não há pressa.',
      'Chegue no seu tempo.',
      'Sinta o peso do corpo onde está.',
      'Só estar aqui já é o bastante.',
      'Solte a mandíbula.',
      'Alguns minutos bastam.',
      'Feche os olhos quando quiser.',
      'O resto pode esperar.',
      'Comece devagar.',
      'Você não precisa esvaziar a mente.',
      'Repare no ar entrando e saindo.',
      'Sente-se como for confortável.',
      'Um dia de cada vez.',
      'Nenhuma sessão é perdida.',
      'Deixe o silêncio fazer o trabalho.',
      'Volte sempre que se distrair.',
      'Sem meta, sem nota.',
      'Note os pés no chão.',
      'Uma respiração já é um começo.',
      'Desacelere antes de começar.',
      'Não julgue o que aparecer.',
      'Fique o tempo que der.',
      'Escute o que já está aqui.',
      'Comece de novo quantas vezes precisar.',
      'Basta sentar e respirar.',
    ],
  },

  guided: {
    heading: 'Guiadas',
    intro: 'Práticas com voz guiada. Toque no coração para guardar as favoritas.',
    favorites: 'Favoritas',
    notFound: 'Meditação não encontrada.',
    rowPlaying: (title) => `${title}, em reprodução`,
    favoriteAdd: (title) => `Adicionar ${title} às favoritas`,
    favoriteRemove: (title) => `Remover ${title} das favoritas`,
  },

  ambience: {
    label: 'Som de fundo',
    silence: 'Silêncio',
    names: {
      'cafe-environment-01': 'Café',
      'nature-01': 'Natureza',
      'nature-02': 'Floresta',
      'nature-birds-01': 'Pássaros',
      'nature-camp-fire-01': 'Fogueira',
      'nature-ocean-01': 'Oceano',
      'nature-river-01': 'Rio',
      'street-environment-01': 'Rua',
      'tonal-bed-01': 'Tons',
    },
  },

  history: {
    heading: 'Histórico',
    intro: 'Cada sessão que você conclui fica marcada aqui. Toque em um dia para ver.',
    legendSession: 'Dia com meditação',
    legendToday: 'Hoje',
    legendSelected: 'Dia selecionado',
    weekdayInitials: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    weekdays: [
      'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
      'quinta-feira', 'sexta-feira', 'sábado',
    ],
    months: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ],
    monthYear: (month, year) => `${month} de ${year}`,
    // Portuguese puts the day before the month, and lowercases it there.
    fullDate: (weekday, day, month) => `${weekday}, ${day} de ${month.toLowerCase()}`,
    sessionCount: (count) => (count === 1 ? '1 sessão' : `${count} sessões`),
  },

  settings: {
    heading: 'Ajustes',
    sound: 'Som',
    gongAtStart: 'Gongo no início',
    gongAtEnd: 'Gongo no fim',
    reminders: 'Lembretes',
    addReminder: 'Adicionar lembrete',
    removeReminder: (time) => `Remover o lembrete das ${time}`,
    language: 'Idioma',
    languageSystem: 'Do aparelho',
  },

  picker: {
    selectDuration: 'Escolha a duração',
    selectTime: 'Escolha o horário',
    cancel: 'Cancelar',
    close: 'Fechar',
    ok: 'OK',
  },

  duration: {
    minutes: (minutes) => `${minutes} min`,
    seconds: (seconds) => `${seconds} s`,
    minutesSeconds: (minutes, seconds) => `${minutes} min ${seconds} s`,
  },

  clock: (hour, minute) => `${pad(hour)}:${pad(minute)}`,

  notification: {
    title: 'Hora de meditar',
    body: 'Reserve um momento para você 🧘',
  },
};
