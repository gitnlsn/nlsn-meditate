/**
 * The Library: short lessons on what meditation is, where it comes from, and
 * what the research says about it.
 *
 * Kept out of the i18n catalogues for the same reason the guided meditations
 * are: this is content, not interface, and each language carries its own full
 * text. A translation keeps the id of its original, so what you have read
 * carries over when the language changes.
 *
 * Every lesson cites what it rests on. Scripture is quoted by its canonical
 * reference (MN 10, AN 3.65) and paraphrased rather than lifted from one
 * copyrighted translation; studies are named by author, year and journal. A
 * claim that cannot be pointed at does not go in.
 */
import type { Locale } from '@/constants/i18n';

export type LibraryTrackId = 'foundations' | 'buddhism' | 'science';

export interface LibrarySource {
  /** Author, year, title and venue, as one would cite it. */
  label: string;
  url?: string;
}

export interface LibraryLesson {
  id: string;
  track: LibraryTrackId;
  title: string;
  /** One line under the title in the lesson list. */
  summary: string;
  readingMinutes: number;
  /** One paragraph per entry. */
  body: string[];
  /** Something small to try on the next sit, so a lesson ends in practice. */
  practice: string;
  /** Guided meditations to try it with, by id. Ids not bundled are skipped. */
  related?: string[];
  sources: LibrarySource[];
}

export interface LibraryTrack {
  id: LibraryTrackId;
  title: string;
  description: string;
}

export const LIBRARY_TRACKS: Record<Locale, LibraryTrack[]> = {
  pt: [
    {
      id: 'foundations',
      title: 'Fundamentos',
      description: 'O que é meditação, o que é atenção plena e como praticar.',
    },
    {
      id: 'buddhism',
      title: 'Meditação e Budismo',
      description: 'Os ensinamentos de onde a prática vem, a partir dos textos.',
    },
    {
      id: 'science',
      title: 'Psicologia e Neurociência',
      description: 'O que a pesquisa mostra, e o que ainda não mostra.',
    },
  ],
  en: [
    {
      id: 'foundations',
      title: 'Foundations',
      description: 'What meditation is, what mindfulness is, and how to practise.',
    },
    {
      id: 'buddhism',
      title: 'Meditation and Buddhism',
      description: 'The teachings the practice comes from, read from the texts.',
    },
    {
      id: 'science',
      title: 'Psychology and Neuroscience',
      description: 'What the research shows, and what it does not yet.',
    },
  ],
};

const SOURCES = {
  kabatZinn1994: {
    label: 'Kabat-Zinn, J. (1994). Wherever You Go, There You Are. Hyperion.',
  },
  lutz2008: {
    label:
      'Lutz, A., Slagter, H. A., Dunne, J. D., & Davidson, R. J. (2008). Attention regulation and monitoring in meditation. Trends in Cognitive Sciences, 12(4), 163–169.',
    url: 'https://doi.org/10.1016/j.tics.2008.01.005',
  },
  mn10: {
    label: 'Satipaṭṭhāna Sutta (MN 10), tr. Bhikkhu Sujato. SuttaCentral.',
    url: 'https://suttacentral.net/mn10/en/sujato',
  },
  analayo2003: {
    label: 'Anālayo (2003). Satipaṭṭhāna: The Direct Path to Realization. Windhorse.',
  },
  killingsworth2010: {
    label:
      'Killingsworth, M. A., & Gilbert, D. T. (2010). A wandering mind is an unhappy mind. Science, 330(6006), 932.',
    url: 'https://doi.org/10.1126/science.1192439',
  },
  brewer2011: {
    label:
      'Brewer, J. A., et al. (2011). Meditation experience is associated with differences in default mode network activity and connectivity. PNAS, 108(50), 20254–20259.',
    url: 'https://doi.org/10.1073/pnas.1112029108',
  },
  draganski2004: {
    label:
      'Draganski, B., et al. (2004). Neuroplasticity: changes in grey matter induced by training. Nature, 427, 311–312.',
    url: 'https://doi.org/10.1038/427311a',
  },
  lazar2005: {
    label:
      'Lazar, S. W., et al. (2005). Meditation experience is associated with increased cortical thickness. NeuroReport, 16(17), 1893–1897.',
    url: 'https://doi.org/10.1097/01.wnr.0000186598.66243.19',
  },
  holzel2011: {
    label:
      'Hölzel, B. K., et al. (2011). Mindfulness practice leads to increases in regional brain gray matter density. Psychiatry Research: Neuroimaging, 191(1), 36–43.',
    url: 'https://doi.org/10.1016/j.pscychresns.2010.08.006',
  },
  kral2022: {
    label:
      'Kral, T. R. A., et al. (2022). Absence of structural brain changes from mindfulness-based stress reduction: Two combined randomized controlled trials. Science Advances, 8(20), eabk3316.',
    url: 'https://doi.org/10.1126/sciadv.abk3316',
  },
  dahl2015: {
    label:
      'Dahl, C. J., Lutz, A., & Davidson, R. J. (2015). Reconstructing and deconstructing the self: cognitive mechanisms in meditation practice. Trends in Cognitive Sciences, 19(9), 515–523.',
    url: 'https://doi.org/10.1016/j.tics.2015.07.001',
  },
  sn46_55: {
    label: 'Saṅgārava Sutta (SN 46.55), tr. Bhikkhu Sujato. SuttaCentral.',
    url: 'https://suttacentral.net/sn46.55/en/sujato',
  },
  an7_61: {
    label: 'Pacalāyamāna Sutta (AN 7.61), tr. Bhikkhu Sujato. SuttaCentral.',
    url: 'https://suttacentral.net/an7.61/en/sujato',
  },
  sn56_11: {
    label: 'Dhammacakkappavattana Sutta (SN 56.11), tr. Bhikkhu Sujato. SuttaCentral.',
    url: 'https://suttacentral.net/sn56.11/en/sujato',
  },
  sn36_6: {
    label: 'Sallatha Sutta (SN 36.6), tr. Bhikkhu Sujato. SuttaCentral.',
    url: 'https://suttacentral.net/sn36.6/en/sujato',
  },
  mn118: {
    label: 'Ānāpānassati Sutta (MN 118), tr. Bhikkhu Sujato. SuttaCentral.',
    url: 'https://suttacentral.net/mn118/en/sujato',
  },
  snp1_8: {
    label: 'Karaṇīya Mettā Sutta (Snp 1.8), tr. Bhikkhu Sujato. SuttaCentral.',
    url: 'https://suttacentral.net/snp1.8/en/sujato',
  },
  visuddhimagga: {
    label: 'Buddhaghosa. Visuddhimagga (The Path of Purification), ch. IX, tr. Bhikkhu Ñāṇamoli.',
  },
  neff2003: {
    label:
      'Neff, K. D. (2003). Self-compassion: An alternative conceptualization of a healthy attitude toward oneself. Self and Identity, 2(2), 85–101.',
    url: 'https://doi.org/10.1080/15298860309032',
  },
  fredrickson2008: {
    label:
      'Fredrickson, B. L., et al. (2008). Open hearts build lives: Positive emotions, induced through loving-kindness meditation, build consequential personal resources. Journal of Personality and Social Psychology, 95(5), 1045–1062.',
    url: 'https://doi.org/10.1037/a0013262',
  },
  goyal2014: {
    label:
      'Goyal, M., et al. (2014). Meditation programs for psychological stress and well-being: A systematic review and meta-analysis. JAMA Internal Medicine, 174(3), 357–368.',
    url: 'https://doi.org/10.1001/jamainternmed.2013.13018',
  },
  kuyken2016: {
    label:
      'Kuyken, W., et al. (2016). Efficacy of mindfulness-based cognitive therapy in prevention of depressive relapse: An individual patient data meta-analysis from randomized trials. JAMA Psychiatry, 73(6), 565–574.',
    url: 'https://doi.org/10.1001/jamapsychiatry.2016.0076',
  },
  vanDam2018: {
    label:
      'Van Dam, N. T., et al. (2018). Mind the hype: A critical evaluation and prescriptive agenda for research on mindfulness and meditation. Perspectives on Psychological Science, 13(1), 36–61.',
    url: 'https://doi.org/10.1177/1745691617709589',
  },
  creswell2014: {
    label:
      'Creswell, J. D., & Lindsay, E. K. (2014). How does mindfulness training affect health? A mindfulness stress buffering account. Current Directions in Psychological Science, 23(6), 401–407.',
    url: 'https://doi.org/10.1177/0963721414547415',
  },
  zaccaro2018: {
    label:
      'Zaccaro, A., et al. (2018). How breath-control can change your life: A systematic review on psycho-physiological correlates of slow breathing. Frontiers in Human Neuroscience, 12, 353.',
    url: 'https://doi.org/10.3389/fnhum.2018.00353',
  },
  lieberman2007: {
    label:
      'Lieberman, M. D., et al. (2007). Putting feelings into words: Affect labeling disrupts amygdala activity in response to affective stimuli. Psychological Science, 18(5), 421–428.',
    url: 'https://doi.org/10.1111/j.1467-9280.2007.01916.x',
  },
  black2015: {
    label:
      'Black, D. S., et al. (2015). Mindfulness meditation and improvement in sleep quality and daytime impairment among older adults with sleep disturbances: A randomized clinical trial. JAMA Internal Medicine, 175(4), 494–501.',
    url: 'https://doi.org/10.1001/jamainternmed.2014.8081',
  },
  jha2007: {
    label:
      'Jha, A. P., Krompinger, J., & Baime, M. J. (2007). Mindfulness training modifies subsystems of attention. Cognitive, Affective, & Behavioral Neuroscience, 7(2), 109–119.',
    url: 'https://doi.org/10.3758/CABN.7.2.109',
  },
} satisfies Record<string, LibrarySource>;

export const LIBRARY_LESSONS: Record<Locale, LibraryLesson[]> = {
  pt: [
    {
      id: 'what-is-meditation',
      track: 'foundations',
      title: 'O que é meditação',
      summary: 'Não é esvaziar a mente. É treinar a atenção.',
      readingMinutes: 3,
      body: [
        'Muita gente desiste de meditar porque acha que está fazendo errado: senta, tenta não pensar em nada, e a mente não para. Mas meditar não é esvaziar a mente. Pensamentos vão surgir — é o que a mente faz.',
        'Uma forma útil de entender a meditação é como um treino da atenção e da consciência. Os pesquisadores Antoine Lutz, Richard Davidson e colegas descrevem duas grandes famílias de prática. Na atenção focada, você escolhe um objeto — a respiração, por exemplo — e volta a ele sempre que se distrai. No monitoramento aberto, você não escolhe objeto: apenas observa o que surge, sem se prender a nada.',
        'Na atenção focada, o momento mais importante não é quando você está concentrado. É quando você percebe que se distraiu e volta. Cada volta é uma repetição, como levantar um peso. Uma sessão em que você se distraiu cinquenta vezes e voltou cinquenta vezes não foi uma sessão ruim — foi um treino de cinquenta repetições.',
        'Jon Kabat-Zinn, que levou a atenção plena para a medicina, a define como prestar atenção de um jeito particular: de propósito, no momento presente, e sem julgamento. Esse "sem julgamento" vale também para a própria prática. Perceber a distração com gentileza, em vez de irritação, já é parte do exercício.',
      ],
      practice:
        'Na próxima sessão, cada vez que perceber que a mente se distraiu, diga mentalmente "voltando" e retorne à respiração. Não conte as distrações como falhas — conte como repetições.',
      related: ['respiracao-5', 'calma-3'],
      sources: [SOURCES.lutz2008, SOURCES.kabatZinn1994],
    },
    {
      id: 'three-families',
      track: 'foundations',
      title: 'As três famílias de prática',
      summary: 'Focar, abrir e cultivar: o que cada tipo de meditação treina.',
      readingMinutes: 3,
      body: [
        'Existem centenas de técnicas de meditação, mas a maioria cabe em poucas famílias. Pesquisadores como Antoine Lutz, Cortland Dahl e Richard Davidson propuseram agrupá-las pelo que cada uma treina na mente. Conhecer as famílias ajuda a escolher a prática certa para o momento.',
        'A primeira é a atenção focada. Você escolhe um objeto — a respiração, as sensações dos pés, um som — e volta a ele sempre que se distrai. Ela treina a estabilidade da atenção: perceber a distração mais cedo e voltar com menos esforço. É a base da maioria das práticas, e a mais indicada para quem está começando.',
        'A segunda é o monitoramento aberto. Em vez de um objeto, você descansa na própria consciência e observa o que surge — sons, sensações, pensamentos, emoções — sem escolher nem se prender a nada. Ela treina a capacidade de perceber a experiência como ela é, sem ser arrastado por ela. Costuma ficar mais fácil depois de algum tempo de atenção focada.',
        'A terceira família cultiva qualidades do coração: bondade amorosa, compaixão, gratidão. Dahl e colegas a chamam de família construtiva, porque ela não só observa a mente — ela fortalece intencionalmente certos estados, como a boa vontade em relação a si mesmo e aos outros.',
        'Nenhuma família é melhor que as outras. Elas se complementam: a atenção focada acalma e estabiliza, o monitoramento aberto amplia a percepção, e as práticas do coração mudam a forma como nos relacionamos com o que percebemos.',
      ],
      practice:
        'Nesta semana, experimente uma prática de cada família: a respiração em um dia, o escaneamento corporal em outro, a bondade amorosa em um terceiro. Repare em qual delas você se sente mais em casa.',
      related: ['respiracao-5', 'corpo-10', 'bondade-12'],
      sources: [SOURCES.lutz2008, SOURCES.dahl2015],
    },
    {
      id: 'five-hindrances',
      track: 'foundations',
      title: 'Os cinco obstáculos',
      summary: 'Sono, inquietação, dúvida: por que a prática às vezes emperra.',
      readingMinutes: 4,
      body: [
        'Toda pessoa que medita conhece as sessões difíceis: o sono que pesa, a agitação que não deixa ficar parado, a voz que diz "isso não serve para nada". O budismo antigo deu nome a essas forças há mais de dois mil anos. São os cinco obstáculos (nīvaraṇa): o desejo sensual, a aversão, a preguiça e o torpor, a inquietação e a preocupação, e a dúvida.',
        'Em um discurso conhecido como Saṅgārava Sutta (SN 46.55), o Buda compara a mente a uma tigela de água em que queremos ver nosso reflexo. O desejo é como água tingida de cores. A aversão, como água fervendo. O torpor, como água coberta de limo. A inquietação, como água agitada pelo vento. A dúvida, como água turva e lamacenta, colocada no escuro. Em nenhum desses casos conseguimos ver com clareza.',
        'O primeiro passo não é lutar contra o obstáculo, mas reconhecê-lo. O Satipaṭṭhāna Sutta ensina a perceber quando um obstáculo está presente, quando está ausente, como ele surge e como vai embora. Só nomear — "isto é inquietação", "isto é dúvida" — já cria um pouco de espaço. O obstáculo deixa de ser "eu" e passa a ser algo que está acontecendo.',
        'Alguns obstáculos têm remédios práticos. Para o sono, a tradição é bem concreta: no Pacalāyamāna Sutta (AN 7.61), o Buda aconselha o discípulo Moggallāna, que cochilava, a mudar o foco da atenção, a recitar ensinamentos, a puxar as orelhas e esfregar os braços, a se levantar e olhar para o céu, ou a meditar caminhando. Hoje diríamos: abra os olhos, endireite a coluna, medite em pé. Para a inquietação, ajuda alongar a expiração e tornar a atenção mais ampla, em vez de apertá-la num ponto só.',
        'E vale lembrar: uma sessão cheia de obstáculos não é uma sessão perdida. Perceber o sono, a pressa ou a dúvida — e voltar — é exatamente o treino.',
      ],
      practice:
        'Na próxima sessão difícil, em vez de se cobrar, dê nome ao que está atrapalhando: desejo, aversão, sono, inquietação ou dúvida. Depois volte à respiração.',
      related: ['respiracao-5', 'ancoragem-4'],
      sources: [SOURCES.sn46_55, SOURCES.an7_61, SOURCES.mn10],
    },
    {
      id: 'practice-for-goals',
      track: 'foundations',
      title: 'Que prática para qual objetivo',
      summary: 'Ansiedade, sono, foco, autocrítica: por onde começar.',
      readingMinutes: 4,
      body: [
        'Cada pessoa chega à meditação por um motivo. Saber o que a pesquisa e a tradição sugerem para cada objetivo ajuda a escolher por onde começar. Uma ressalva: a meditação complementa, mas não substitui, o acompanhamento de um profissional de saúde.',
        'Para ansiedade e estresse, a pesquisa tem as evidências mais consistentes: uma grande revisão de 2014 (Goyal e colegas) encontrou evidência moderada de que programas de atenção plena reduzem a ansiedade. No dia a dia, ajudam práticas curtas de ancoragem quando a mente dispara, e práticas que ensinam a abrir espaço para o desconforto em vez de brigar com ele.',
        'Para dormir melhor, um ensaio randomizado de 2015 (Black e colegas) mostrou que adultos mais velhos com dificuldades de sono que fizeram um programa de atenção plena melhoraram a qualidade do sono. À noite, escolha práticas que soltem o corpo, como o escaneamento corporal, sem a intenção de "ter que" dormir — essa pressão costuma atrapalhar.',
        'Para foco e concentração, a atenção na respiração é o treino mais direto. Estudos como o de Amishi Jha e colegas (2007) sugerem que o treino de atenção plena melhora aspectos específicos da atenção. Sessões curtas e diárias funcionam melhor que sessões longas e raras.',
        'Para autocrítica, irritação e relacionamentos, as práticas de compaixão e bondade amorosa são as mais indicadas. A psicóloga Kristin Neff descreve a autocompaixão como tratar a si mesmo com a gentileza que ofereceríamos a um amigo — e associa essa atitude a mais bem-estar, sem perda de motivação.',
        'Se você não sabe por onde começar, comece pela respiração: cinco minutos por dia. É a base sobre a qual todas as outras práticas se apoiam.',
      ],
      practice:
        'Escolha um único objetivo para as próximas duas semanas e uma prática que combine com ele. Pratique todos os dias e, no fim, repare no que mudou.',
      related: ['ancoragem-4', 'ansiedade-6', 'sono-15', 'corpo-10', 'respiracao-5', 'autocompaixao-7'],
      sources: [SOURCES.goyal2014, SOURCES.black2015, SOURCES.jha2007, SOURCES.neff2003],
    },
    {
      id: 'four-noble-truths',
      track: 'buddhism',
      title: 'As Quatro Nobres Verdades',
      summary: 'O primeiro ensinamento do Buda, e o porquê de toda a prática.',
      readingMinutes: 4,
      body: [
        'Segundo a tradição, depois de despertar, o Buda caminhou até o Parque dos Cervos, em Isipatana, perto da atual Varanasi, e ensinou cinco antigos companheiros de prática. Esse primeiro discurso, o Dhammacakkappavattana Sutta (SN 56.11), apresenta as Quatro Nobres Verdades — o núcleo de todo o ensinamento budista.',
        'A primeira verdade é o sofrimento (dukkha). A palavra também pode ser traduzida como insatisfação: o nascimento, a velhice, a doença e a morte são sofrimento; estar junto do que não amamos e separado do que amamos é sofrimento; não conseguir o que queremos é sofrimento. Não é uma visão pessimista — é um diagnóstico honesto, como o de um médico.',
        'A segunda verdade é a origem do sofrimento: o desejo ávido (taṇhā), literalmente "sede". Sede por prazeres, sede por ser e sede por não ser. É o movimento da mente de agarrar o que agrada e empurrar o que desagrada. A terceira verdade é que esse sofrimento pode cessar, com o desaparecimento dessa sede.',
        'A quarta verdade é o caminho para essa cessação: o Nobre Caminho Óctuplo — visão correta, intenção correta, fala correta, ação correta, modo de vida correto, esforço correto, atenção plena correta e concentração correta. O próprio discurso o apresenta como um caminho do meio, entre a busca por prazeres e o autoflagelo.',
        'Em outro discurso, o Sallatha Sutta (SN 36.6), o Buda usa a imagem de duas flechas. A primeira é a dor que a vida traz, e que ninguém evita. A segunda é a que nós mesmos atiramos: a preocupação, a revolta, a história que contamos sobre a dor. A meditação não impede a primeira flecha, mas pode nos ensinar a não atirar a segunda.',
      ],
      practice:
        'Na próxima vez que algo desagradável acontecer, pergunte a si mesmo: "qual é a primeira flecha aqui, e qual é a segunda?". Só perceber a diferença já ajuda.',
      related: ['ansiedade-6'],
      sources: [SOURCES.sn56_11, SOURCES.sn36_6],
    },
    {
      id: 'four-foundations',
      track: 'buddhism',
      title: 'Os quatro fundamentos da atenção plena',
      summary: 'O Satipaṭṭhāna Sutta, o texto clássico sobre atenção plena.',
      readingMinutes: 4,
      body: [
        'A palavra que traduzimos como "atenção plena" é sati, em páli, a língua dos primeiros textos budistas. Sati tem relação com lembrar: é a capacidade de manter presente aquilo que se está observando, sem perdê-lo de vista.',
        'O texto mais conhecido sobre o tema é o Satipaṭṭhāna Sutta, preservado no Majjhima Nikāya, a coleção dos discursos médios (MN 10). Nele, o Buda apresenta a atenção plena como um caminho direto para a purificação dos seres, para superar a tristeza e o lamento e para o fim da dor e da angústia.',
        'O discurso organiza a prática em quatro campos. O corpo: a respiração, as posturas, os movimentos. As sensações, no sentido de tom afetivo (vedanā): toda experiência chega como agradável, desagradável ou neutra. A mente: notar se ela está, por exemplo, agitada ou calma, dispersa ou concentrada. E os fenômenos (dhammas): padrões da experiência que o texto ensina a reconhecer, como os obstáculos que atrapalham a prática.',
        'Em cada campo, o praticante é descrito com três qualidades: ardente (com energia), plenamente consciente e atento, tendo deixado de lado a cobiça e o descontentamento em relação ao mundo. Ou seja, a atenção plena budista não é só observar — é observar com esforço equilibrado e sem se agarrar ao que agrada nem rejeitar o que desagrada.',
        'Vale notar que, no budismo, a atenção plena é um dos oito fatores do Nobre Caminho Óctuplo, ao lado da ética e da sabedoria. Ela não foi pensada como técnica isolada, mas como parte de um caminho para a libertação do sofrimento.',
      ],
      practice:
        'Na próxima sessão, observe o tom afetivo de cada sensação que aparecer. Apenas note mentalmente: "agradável", "desagradável" ou "neutro" — sem tentar mudar nada.',
      related: ['corpo-10', 'respiracao-5'],
      sources: [SOURCES.mn10, SOURCES.analayo2003],
    },
    {
      id: 'anapanasati',
      track: 'buddhism',
      title: 'Ānāpānasati: a respiração em 16 passos',
      summary: 'O texto que está na origem da meditação na respiração.',
      readingMinutes: 4,
      body: [
        'A meditação na respiração é a prática mais comum do mundo, e seu texto de referência é o Ānāpānasati Sutta (MN 118). Ānāpāna quer dizer inspirar e expirar; sati, atenção plena. O discurso descreve o praticante que vai a um lugar tranquilo, senta com o corpo ereto, estabelece a atenção e, atento, inspira e expira.',
        'O que surpreende é que a prática não para em "observar a respiração". O texto descreve dezesseis passos, em quatro grupos de quatro. No primeiro grupo, o corpo: perceber a respiração longa como longa, a curta como curta, sentir o corpo inteiro e acalmar o corpo.',
        'No segundo grupo, as sensações: respirar sentindo alegria, sentindo bem-estar, percebendo os processos mentais e acalmando-os. No terceiro, a própria mente: percebê-la, alegrá-la, concentrá-la e libertá-la. No quarto, a sabedoria: contemplar a impermanência, o desapego, a cessação e o abandono.',
        'Os quatro grupos correspondem aos quatro fundamentos da atenção plena — corpo, sensações, mente e fenômenos. O discurso afirma que a atenção na respiração, desenvolvida dessa forma, realiza os quatro fundamentos. Ou seja: a respiração não é só um ponto de foco, é uma porta para todo o caminho.',
        'Para quem pratica, a lição é animadora. Não é preciso trocar de técnica para aprofundar a prática. A mesma respiração que acalma no começo pode, com o tempo, levar a perceber as emoções, a mente e a natureza passageira de tudo.',
      ],
      practice:
        'Nas próximas sessões, trabalhe só os quatro primeiros passos: perceba se a respiração está longa ou curta, depois sinta o corpo inteiro respirando, e por fim deixe que cada expiração acalme um pouco o corpo.',
      related: ['respiracao-5'],
      sources: [SOURCES.mn118, SOURCES.analayo2003],
    },
    {
      id: 'metta',
      track: 'buddhism',
      title: 'Mettā e os quatro estados sublimes',
      summary: 'Bondade, compaixão, alegria e equanimidade, dos textos à pesquisa.',
      readingMinutes: 4,
      body: [
        'Além da atenção, o budismo cultiva o coração. Os brahmavihāras, os quatro estados sublimes, são: mettā, a bondade amorosa — desejar que os seres fiquem bem; karuṇā, a compaixão — o desejo de que o sofrimento cesse; muditā, a alegria com a felicidade dos outros; e upekkhā, a equanimidade — a estabilidade que não se deixa arrastar.',
        'O texto mais conhecido sobre mettā é o Karaṇīya Mettā Sutta (Snp 1.8). Ele pede que se deseje: que todos os seres fiquem bem e em segurança, que todos sejam felizes. E usa uma imagem marcante: assim como uma mãe protegeria seu único filho com a própria vida, assim se deve cultivar um coração sem limites para com todos os seres.',
        'A tradição posterior, no Visuddhimagga de Buddhaghosa, faz uma observação muito útil: cada estado tem um inimigo distante, que é seu oposto, e um inimigo próximo, que se parece com ele. O inimigo distante da bondade é a raiva; o próximo é o apego. O inimigo próximo da compaixão é a tristeza que nos afunda junto com o outro. O inimigo próximo da equanimidade é a indiferença.',
        'A pesquisa moderna também estudou essas práticas. Barbara Fredrickson e colegas (2008) mostraram que algumas semanas de meditação da bondade amorosa aumentaram emoções positivas no dia a dia, o que por sua vez se associou a mais satisfação com a vida. A psicóloga Kristin Neff descreve a autocompaixão em três partes: gentileza consigo mesmo, reconhecer que o sofrimento faz parte da experiência humana, e atenção plena para não fugir nem exagerar a dor.',
        'Na prática, é comum começar por si mesmo ou por alguém fácil de amar, e depois estender a boa vontade a um conhecido, a alguém difícil e, por fim, a todos os seres. Não é preciso sentir algo especial: a intenção, repetida, é o treino.',
      ],
      practice:
        'Hoje, ao cruzar com desconhecidos, deseje em silêncio: "que você fique bem". Repare no que muda em você.',
      related: ['bondade-12', 'autocompaixao-7', 'compaixao-3'],
      sources: [SOURCES.snp1_8, SOURCES.visuddhimagga, SOURCES.fredrickson2008, SOURCES.neff2003],
    },
    {
      id: 'wandering-mind',
      track: 'science',
      title: 'Uma mente que divaga',
      summary: 'Quanto tempo passamos fora do presente, e o que isso faz conosco.',
      readingMinutes: 3,
      body: [
        'Em 2010, os psicólogos Matthew Killingsworth e Daniel Gilbert, de Harvard, publicaram na revista Science um estudo com milhares de adultos. Por meio de um aplicativo de celular, eles perguntavam em momentos aleatórios do dia: o que você está fazendo, está pensando em outra coisa, e como você se sente?',
        'O resultado: as pessoas estavam pensando em algo diferente do que faziam em quase metade do tempo (46,9%). E estavam, em média, menos felizes quando a mente divagava — mesmo quando divagava para pensamentos agradáveis, elas não ficavam mais felizes do que quando estavam presentes. O título do artigo resume: "uma mente que divaga é uma mente infeliz".',
        'A neurociência tem um nome para a rede cerebral mais ativa quando a mente vagueia, especialmente em pensamentos sobre nós mesmos: a rede de modo padrão (default mode network). Em 2011, Judson Brewer e colegas compararam meditadores experientes com pessoas que nunca tinham meditado e encontraram menos atividade nas regiões centrais dessa rede nos meditadores, durante a meditação.',
        'É importante ler esses resultados com cuidado. O estudo de Killingsworth e Gilbert mostra associação, e uma análise temporal sugere que a divagação vem antes da infelicidade — mas não prova que seja a única causa. O estudo de Brewer foi pequeno e comparou grupos diferentes, então não mostra que a meditação causou a diferença. São pistas consistentes com o que a prática propõe, não provas definitivas.',
      ],
      practice:
        'Hoje, em três momentos aleatórios do dia, pergunte a si mesmo: "onde está minha mente agora?". Só note a resposta, sem se corrigir.',
      related: ['calma-3', 'respiracao-5'],
      sources: [SOURCES.killingsworth2010, SOURCES.brewer2011],
    },
    {
      id: 'stress-body',
      track: 'science',
      title: 'Estresse, corpo e sistema nervoso',
      summary: 'O que acontece no corpo sob estresse, e como a prática ajuda.',
      readingMinutes: 4,
      body: [
        'Diante de uma ameaça, o corpo reage antes de pensarmos: o sistema nervoso simpático acelera o coração e a respiração, e o eixo hormonal do estresse libera cortisol. É a resposta de luta ou fuga — útil diante de perigos reais. O problema é que ela também dispara diante de um e-mail, de uma lembrança ou de uma preocupação com o futuro, e pode ficar ligada por muito tempo.',
        'O outro lado é o sistema nervoso parassimpático, que desacelera o corpo e favorece o descanso e a recuperação. A respiração é uma das poucas portas conscientes para esse sistema. Ao expirar, o coração naturalmente desacelera um pouco. Uma revisão de 2018 (Zaccaro e colegas) concluiu que respirar devagar, em torno de seis respirações por minuto, está associado a mais atividade parassimpática e a mais sensação de calma.',
        'A atenção plena também age pelo lado da mente. Em um estudo de 2007, Matthew Lieberman e colegas mostraram que dar nome a uma emoção — "isto é raiva", "isto é medo" — reduzia a atividade da amígdala, uma região ligada à reação de alarme. É exatamente o que muitas práticas ensinam: notar e nomear o que surge.',
        'Os psicólogos David Creswell e Emily Lindsay propõem que a atenção plena protege a saúde principalmente como um amortecedor do estresse: ela muda a forma como avaliamos e reagimos às situações difíceis, o que, ao longo do tempo, reduz a carga de estresse sobre o corpo. A ideia é coerente com os estudos, mas ainda está sendo testada.',
        'Em resumo: não dá para evitar o estresse, mas dá para treinar a forma como respondemos a ele. A respiração lenta acalma o corpo; nomear acalma a mente.',
      ],
      practice:
        'Quando sentir o estresse subir, faça um minuto de respiração com a expiração mais longa que a inspiração — por exemplo, inspire contando até quatro e expire contando até seis.',
      related: ['calma-3', 'ancoragem-4', 'ansiedade-6'],
      sources: [SOURCES.zaccaro2018, SOURCES.lieberman2007, SOURCES.creswell2014],
    },
    {
      id: 'neuroplasticity',
      track: 'science',
      title: 'Meditação e neuroplasticidade',
      summary: 'O cérebro muda com o que repetimos. O que isso diz sobre a prática.',
      readingMinutes: 4,
      body: [
        'Durante muito tempo se acreditou que o cérebro adulto era praticamente fixo. Hoje sabemos que não: ele muda ao longo da vida conforme o que fazemos, pensamos e repetimos. Essa capacidade se chama neuroplasticidade. Conexões usadas com frequência se fortalecem; as que deixamos de usar se enfraquecem.',
        'Um exemplo clássico: em 2004, Bogdan Draganski e colegas publicaram na Nature um estudo em que adultos aprenderam a fazer malabarismo durante três meses. Exames de ressonância mostraram aumento de massa cinzenta em áreas ligadas à percepção de movimento. Meses depois de pararem de treinar, esse aumento tinha diminuído. O cérebro acompanha o que praticamos — e o que deixamos de praticar.',
        'Se a meditação é um treino da atenção, faz sentido perguntar se ela também deixa marcas no cérebro. Em 2005, Sara Lazar e colegas encontraram córtex mais espesso em regiões ligadas à atenção e à percepção do corpo, como a ínsula, em meditadores experientes. Em 2011, Britta Hölzel e colegas acompanharam pessoas antes e depois de oito semanas do programa MBSR e relataram aumento de densidade de massa cinzenta em regiões como o hipocampo, ligado à memória e à regulação emocional.',
        'Mas a história tem um capítulo importante. Em 2022, Tammi Kral e colegas publicaram na Science Advances dois ensaios randomizados, com mais de duzentos participantes — bem maiores que os estudos anteriores — e não encontraram mudanças estruturais no cérebro após oito semanas de MBSR. Estudos pequenos tendem a encontrar efeitos que não se repetem em amostras maiores. Hoje, a conclusão honesta é que mudanças visíveis na estrutura do cérebro após poucas semanas de meditação não estão comprovadas.',
        'O que permanece sólido é o princípio: o cérebro se adapta ao que fazemos repetidamente. Cada vez que você percebe uma distração e volta, está exercitando um hábito mental. Não é preciso uma imagem de ressonância para que isso valha a pena — mas é um bom motivo para pensar a prática como um treino de longo prazo, e não como algo que muda tudo em oito semanas.',
      ],
      practice:
        'Como em qualquer treino, a regularidade conta mais que a duração. Nesta semana, experimente sentar todos os dias, mesmo que só por cinco minutos.',
      related: ['respiracao-5'],
      sources: [SOURCES.draganski2004, SOURCES.lazar2005, SOURCES.holzel2011, SOURCES.kral2022],
    },
    {
      id: 'research-evidence',
      track: 'science',
      title: 'O que a pesquisa mostra',
      summary: 'Ansiedade, depressão e dor: as evidências, e seus limites.',
      readingMinutes: 4,
      body: [
        'Em 2014, Madhav Goyal e colegas, da Universidade Johns Hopkins, publicaram uma das revisões mais citadas sobre o tema. Eles reuniram 47 ensaios clínicos randomizados, com mais de 3.500 participantes, para responder a uma pergunta simples: programas de meditação ajudam no estresse e no bem-estar?',
        'Para programas de atenção plena, a resposta foi: há evidência moderada de melhora em ansiedade, depressão e dor. Os autores observaram que o efeito na depressão é parecido com o que se espera de antidepressivos em pacientes da atenção primária. Para outros desfechos — como humor positivo, atenção e sono —, as evidências eram baixas ou insuficientes. E a meditação não se mostrou superior a outros tratamentos ativos, como exercício ou terapia.',
        'Um dos resultados mais sólidos é o da Terapia Cognitiva Baseada em Mindfulness (MBCT), criada para pessoas com depressão recorrente. Uma meta-análise de 2016 (Kuyken e colegas), com dados individuais de mais de mil pacientes, mostrou que quem fez MBCT teve menos recaídas nos meses seguintes do que quem não fez — inclusive na comparação com outros tratamentos ativos. No Reino Unido, a MBCT é recomendada pelas diretrizes oficiais para depressão recorrente.',
        'Ao mesmo tempo, Nicholas Van Dam e outros pesquisadores publicaram em 2018 um alerta: o entusiasmo com a atenção plena cresceu mais rápido que a ciência. Muitos estudos são pequenos, a própria palavra "mindfulness" é usada de formas diferentes, e efeitos adversos são pouco estudados. Para algumas pessoas — especialmente com histórico de trauma ou condições graves de saúde mental —, a prática intensa pode trazer à tona experiências difíceis.',
        'A conclusão equilibrada: a meditação é uma ferramenta útil, com benefícios reais e modestos, especialmente para ansiedade, depressão e dor. Não é cura para tudo, e não substitui tratamento. Se você está passando por um momento difícil, pratique junto com o acompanhamento de um profissional.',
      ],
      practice:
        'Antes de cada sessão nesta semana, dê uma nota de 0 a 10 para como você está. Depois, dê outra. Observar seus próprios dados é o seu pequeno experimento.',
      related: ['ansiedade-6', 'respiracao-5'],
      sources: [SOURCES.goyal2014, SOURCES.kuyken2016, SOURCES.vanDam2018],
    },
  ],
  en: [
    {
      id: 'what-is-meditation',
      track: 'foundations',
      title: 'What meditation is',
      summary: 'Not emptying the mind. Training attention.',
      readingMinutes: 3,
      body: [
        'Many people give up on meditation because they think they are doing it wrong: they sit, try to think of nothing, and the mind will not stop. But meditation is not emptying the mind. Thoughts will come — that is what minds do.',
        'A useful way to understand meditation is as training for attention and awareness. The researchers Antoine Lutz, Richard Davidson and colleagues describe two broad families of practice. In focused attention, you choose an object — the breath, say — and return to it whenever you drift. In open monitoring, you choose no object: you simply observe whatever arises, without holding on to any of it.',
        'In focused attention, the most important moment is not when you are concentrated. It is when you notice you have drifted and come back. Each return is a repetition, like lifting a weight. A sit in which you wandered fifty times and came back fifty times was not a bad sit — it was a fifty-rep workout.',
        'Jon Kabat-Zinn, who brought mindfulness into medicine, defines it as paying attention in a particular way: on purpose, in the present moment, and non-judgmentally. That "non-judgmentally" applies to the practice itself, too. Noticing a distraction with kindness rather than irritation is already part of the exercise.',
      ],
      practice:
        'On your next sit, each time you notice the mind has wandered, say "returning" silently and come back to the breath. Do not count the distractions as failures — count them as repetitions.',
      related: ['respiracao-5', 'calma-3'],
      sources: [SOURCES.lutz2008, SOURCES.kabatZinn1994],
    },
    {
      id: 'three-families',
      track: 'foundations',
      title: 'The three families of practice',
      summary: 'Focusing, opening and cultivating: what each kind of meditation trains.',
      readingMinutes: 3,
      body: [
        'There are hundreds of meditation techniques, but most fit into a few families. Researchers such as Antoine Lutz, Cortland Dahl and Richard Davidson have proposed grouping them by what each one trains in the mind. Knowing the families helps you choose the right practice for the moment.',
        'The first is focused attention. You choose an object — the breath, the sensations in your feet, a sound — and return to it whenever you drift. It trains the stability of attention: noticing distraction sooner and coming back with less effort. It is the basis of most practices, and the best place to begin.',
        'The second is open monitoring. Instead of an object, you rest in awareness itself and observe whatever arises — sounds, sensations, thoughts, emotions — without choosing or holding on to any of it. It trains the ability to see experience as it is, without being carried off by it. It tends to come more easily after some time with focused attention.',
        'The third family cultivates qualities of the heart: loving-kindness, compassion, gratitude. Dahl and colleagues call it the constructive family, because it does not only observe the mind — it deliberately strengthens certain states, such as goodwill towards yourself and others.',
        'No family is better than the others. They complement each other: focused attention calms and steadies, open monitoring widens awareness, and the practices of the heart change how we relate to what we notice.',
      ],
      practice:
        'This week, try one practice from each family: the breath one day, the body scan another, loving-kindness on a third. Notice which one feels most like home.',
      related: ['respiracao-5', 'corpo-10', 'bondade-12'],
      sources: [SOURCES.lutz2008, SOURCES.dahl2015],
    },
    {
      id: 'five-hindrances',
      track: 'foundations',
      title: 'The five hindrances',
      summary: 'Sleepiness, restlessness, doubt: why practice sometimes gets stuck.',
      readingMinutes: 4,
      body: [
        'Everyone who meditates knows the hard sits: the heavy drowsiness, the agitation that will not let you stay still, the voice that says "this is pointless". Early Buddhism named these forces more than two thousand years ago. They are the five hindrances (nīvaraṇa): sensual desire, ill will, sloth and torpor, restlessness and worry, and doubt.',
        'In a discourse known as the Saṅgārava Sutta (SN 46.55), the Buddha compares the mind to a bowl of water in which we want to see our reflection. Desire is like water dyed with colours. Ill will, like water boiling. Torpor, like water covered in moss. Restlessness, like water rippled by the wind. Doubt, like muddy, cloudy water set in the dark. In none of these can we see clearly.',
        'The first step is not to fight the hindrance but to recognise it. The Satipaṭṭhāna Sutta teaches noticing when a hindrance is present, when it is absent, how it arises and how it is let go. Simply naming it — "this is restlessness", "this is doubt" — already creates a little space. The hindrance stops being "me" and becomes something that is happening.',
        'Some hindrances have practical remedies. For drowsiness, the tradition is very concrete: in the Pacalāyamāna Sutta (AN 7.61), the Buddha advises his disciple Moggallāna, who kept nodding off, to shift his attention, to recite teachings, to pull his ears and rub his limbs, to get up and look at the sky, or to practise walking meditation. Today we would say: open your eyes, straighten your back, meditate standing. For restlessness, it helps to lengthen the out-breath and widen your attention rather than squeezing it onto one point.',
        'And remember: a sit full of hindrances is not a wasted sit. Noticing the sleepiness, the hurry or the doubt — and coming back — is exactly the training.',
      ],
      practice:
        'On your next hard sit, instead of scolding yourself, name what is in the way: desire, ill will, sleepiness, restlessness or doubt. Then return to the breath.',
      related: ['respiracao-5', 'ancoragem-4'],
      sources: [SOURCES.sn46_55, SOURCES.an7_61, SOURCES.mn10],
    },
    {
      id: 'practice-for-goals',
      track: 'foundations',
      title: 'Which practice for which goal',
      summary: 'Anxiety, sleep, focus, self-criticism: where to begin.',
      readingMinutes: 4,
      body: [
        'Everyone comes to meditation for a reason. Knowing what the research and the tradition suggest for each goal helps you choose where to begin. One caveat: meditation complements the care of a health professional, but does not replace it.',
        'For anxiety and stress, the research is most consistent: a large 2014 review (Goyal and colleagues) found moderate evidence that mindfulness programmes reduce anxiety. Day to day, it helps to use short grounding practices when the mind races, and practices that teach you to make room for discomfort instead of fighting it.',
        'For better sleep, a 2015 randomised trial (Black and colleagues) found that older adults with sleep difficulties who took a mindfulness programme improved their sleep quality. At night, choose practices that let the body go, such as the body scan, without the aim of "having to" fall asleep — that pressure tends to get in the way.',
        'For focus and concentration, attention on the breath is the most direct training. Studies such as Amishi Jha and colleagues\' (2007) suggest mindfulness training improves specific aspects of attention. Short daily sessions work better than long, rare ones.',
        'For self-criticism, irritability and relationships, the practices of compassion and loving-kindness fit best. The psychologist Kristin Neff describes self-compassion as treating yourself with the kindness you would offer a friend — and links that attitude with greater well-being, without any loss of motivation.',
        'If you do not know where to begin, begin with the breath: five minutes a day. It is the ground every other practice stands on.',
      ],
      practice:
        'Choose one goal for the next two weeks, and one practice that matches it. Practise every day and, at the end, notice what has changed.',
      related: ['ancoragem-4', 'ansiedade-6', 'sono-15', 'corpo-10', 'respiracao-5', 'autocompaixao-7'],
      sources: [SOURCES.goyal2014, SOURCES.black2015, SOURCES.jha2007, SOURCES.neff2003],
    },
    {
      id: 'four-noble-truths',
      track: 'buddhism',
      title: 'The Four Noble Truths',
      summary: 'The Buddha\'s first teaching, and the reason behind all practice.',
      readingMinutes: 4,
      body: [
        'According to tradition, after his awakening the Buddha walked to the Deer Park at Isipatana, near today\'s Varanasi, and taught five former companions in practice. That first discourse, the Dhammacakkappavattana Sutta (SN 56.11), sets out the Four Noble Truths — the core of all Buddhist teaching.',
        'The first truth is suffering (dukkha). The word can also be translated as unsatisfactoriness: birth, ageing, sickness and death are suffering; being with what we do not love and apart from what we love is suffering; not getting what we want is suffering. It is not a pessimistic view — it is an honest diagnosis, like a doctor\'s.',
        'The second truth is the origin of suffering: craving (taṇhā), literally "thirst". Thirst for pleasures, thirst to be, and thirst not to be. It is the movement of the mind grasping at what pleases and pushing away what does not. The third truth is that this suffering can end, with the fading away of that thirst.',
        'The fourth truth is the path to that ending: the Noble Eightfold Path — right view, right intention, right speech, right action, right livelihood, right effort, right mindfulness and right concentration. The discourse itself presents it as a middle way, between the pursuit of pleasure and self-mortification.',
        'In another discourse, the Sallatha Sutta (SN 36.6), the Buddha uses the image of two arrows. The first is the pain life brings, which no one avoids. The second is the one we shoot ourselves: the worry, the resentment, the story we tell about the pain. Meditation does not stop the first arrow, but it can teach us not to shoot the second.',
      ],
      practice:
        'The next time something unpleasant happens, ask yourself: "what is the first arrow here, and what is the second?". Just noticing the difference helps.',
      related: ['ansiedade-6'],
      sources: [SOURCES.sn56_11, SOURCES.sn36_6],
    },
    {
      id: 'four-foundations',
      track: 'buddhism',
      title: 'The four foundations of mindfulness',
      summary: 'The Satipaṭṭhāna Sutta, the classic text on mindfulness.',
      readingMinutes: 4,
      body: [
        'The word we translate as "mindfulness" is sati, in Pāli, the language of the early Buddhist texts. Sati is related to remembering: it is the capacity to keep in mind what you are observing, without losing sight of it.',
        'The best-known text on the subject is the Satipaṭṭhāna Sutta, preserved in the Majjhima Nikāya, the collection of middle-length discourses (MN 10). In it, the Buddha presents mindfulness as a direct path for the purification of beings, for overcoming sorrow and lamentation, and for the ending of pain and distress.',
        'The discourse organises the practice into four fields. The body: the breath, the postures, movement. Feelings, in the sense of affective tone (vedanā): every experience arrives as pleasant, unpleasant or neutral. The mind: noticing whether it is, for instance, restless or calm, scattered or collected. And phenomena (dhammas): patterns of experience the text teaches you to recognise, such as the hindrances that get in the way of practice.',
        'In each field, the practitioner is described with three qualities: ardent, clearly aware, and mindful, having set aside desire and discontent for the world. Buddhist mindfulness, in other words, is not only observing — it is observing with balanced effort, without grasping at what is pleasant or pushing away what is not.',
        'It is worth remembering that in Buddhism mindfulness is one of the eight factors of the Noble Eightfold Path, alongside ethics and wisdom. It was never meant as a standalone technique, but as part of a path to freedom from suffering.',
      ],
      practice:
        'On your next sit, notice the affective tone of each sensation that appears. Just note silently: "pleasant", "unpleasant" or "neutral" — without trying to change anything.',
      related: ['corpo-10', 'respiracao-5'],
      sources: [SOURCES.mn10, SOURCES.analayo2003],
    },
    {
      id: 'anapanasati',
      track: 'buddhism',
      title: 'Ānāpānasati: the breath in 16 steps',
      summary: 'The text at the origin of breath meditation.',
      readingMinutes: 4,
      body: [
        'Breath meditation is the most common practice in the world, and its source text is the Ānāpānasati Sutta (MN 118). Ānāpāna means breathing in and out; sati, mindfulness. The discourse describes the practitioner going to a quiet place, sitting with the body upright, establishing mindfulness and, mindful, breathing in and breathing out.',
        'What is surprising is that the practice does not stop at "watching the breath". The text describes sixteen steps, in four groups of four. In the first group, the body: knowing a long breath as long and a short breath as short, experiencing the whole body, and calming the body.',
        'In the second group, feelings: breathing while experiencing joy, experiencing ease, noticing mental processes and calming them. In the third, the mind itself: experiencing it, gladdening it, collecting it and freeing it. In the fourth, wisdom: contemplating impermanence, fading away, cessation and letting go.',
        'The four groups match the four foundations of mindfulness — body, feelings, mind and phenomena. The discourse says that mindfulness of breathing, developed in this way, fulfils all four. In other words: the breath is not just a point of focus, it is a doorway to the whole path.',
        'For practitioners, this is encouraging. You do not need to change technique to deepen your practice. The same breath that calms you at the start can, over time, lead you to notice emotions, the mind, and the passing nature of everything.',
      ],
      practice:
        'For your next sits, work only with the first four steps: notice whether the breath is long or short, then feel the whole body breathing, and finally let each out-breath calm the body a little.',
      related: ['respiracao-5'],
      sources: [SOURCES.mn118, SOURCES.analayo2003],
    },
    {
      id: 'metta',
      track: 'buddhism',
      title: 'Mettā and the four sublime states',
      summary: 'Kindness, compassion, joy and equanimity, from the texts to the research.',
      readingMinutes: 4,
      body: [
        'Besides attention, Buddhism cultivates the heart. The brahmavihāras, the four sublime states, are: mettā, loving-kindness — wishing beings well; karuṇā, compassion — the wish for suffering to end; muditā, joy in the happiness of others; and upekkhā, equanimity — a steadiness that is not swept away.',
        'The best-known text on mettā is the Karaṇīya Mettā Sutta (Snp 1.8). It asks us to wish: may all beings be well and safe, may all beings be happy. And it offers a striking image: just as a mother would protect her only child with her life, so one should cultivate a boundless heart towards all beings.',
        'The later tradition, in Buddhaghosa\'s Visuddhimagga, makes a very useful observation: each state has a far enemy, its opposite, and a near enemy, which resembles it. The far enemy of kindness is hatred; the near enemy is attachment. The near enemy of compassion is the sorrow that sinks us along with the other person. The near enemy of equanimity is indifference.',
        'Modern research has studied these practices too. Barbara Fredrickson and colleagues (2008) showed that a few weeks of loving-kindness meditation increased everyday positive emotions, which in turn went with greater life satisfaction. The psychologist Kristin Neff describes self-compassion in three parts: kindness towards yourself, recognising that suffering is part of the shared human experience, and mindfulness, so as neither to run from pain nor to exaggerate it.',
        'In practice, it is common to begin with yourself or with someone easy to love, then extend goodwill to an acquaintance, to someone difficult and, finally, to all beings. You do not need to feel anything special: the intention, repeated, is the training.',
      ],
      practice:
        'Today, as you pass strangers, wish silently: "may you be well". Notice what changes in you.',
      related: ['bondade-12', 'autocompaixao-7', 'compaixao-3'],
      sources: [SOURCES.snp1_8, SOURCES.visuddhimagga, SOURCES.fredrickson2008, SOURCES.neff2003],
    },
    {
      id: 'wandering-mind',
      track: 'science',
      title: 'A wandering mind',
      summary: 'How much time we spend away from the present, and what it does to us.',
      readingMinutes: 3,
      body: [
        'In 2010, the Harvard psychologists Matthew Killingsworth and Daniel Gilbert published a study in Science with thousands of adults. Through a phone app, they asked at random moments of the day: what are you doing, are you thinking about something else, and how do you feel?',
        'The result: people were thinking about something other than what they were doing almost half the time (46.9%). And they were, on average, less happy when their minds wandered — even when they wandered to pleasant thoughts, they were no happier than when they were present. The paper\'s title sums it up: "a wandering mind is an unhappy mind".',
        'Neuroscience has a name for the brain network most active when the mind wanders, especially into thoughts about ourselves: the default mode network. In 2011, Judson Brewer and colleagues compared experienced meditators with people who had never meditated, and found less activity in the network\'s central regions in the meditators, while they meditated.',
        'These findings need careful reading. Killingsworth and Gilbert show an association, and a time-lag analysis suggests mind-wandering comes before the unhappiness — but that does not prove it is the only cause. Brewer\'s study was small and compared different groups, so it does not show that meditation caused the difference. They are clues consistent with what the practice proposes, not final proof.',
      ],
      practice:
        'Today, at three random moments, ask yourself: "where is my mind right now?". Just notice the answer, without correcting yourself.',
      related: ['calma-3', 'respiracao-5'],
      sources: [SOURCES.killingsworth2010, SOURCES.brewer2011],
    },
    {
      id: 'stress-body',
      track: 'science',
      title: 'Stress, the body and the nervous system',
      summary: 'What happens in the body under stress, and how practice helps.',
      readingMinutes: 4,
      body: [
        'Faced with a threat, the body reacts before we think: the sympathetic nervous system speeds up the heart and the breath, and the hormonal stress axis releases cortisol. It is the fight-or-flight response — useful in the face of real danger. The trouble is that it also fires at an email, a memory or a worry about the future, and can stay switched on for a long time.',
        'The other side is the parasympathetic nervous system, which slows the body down and supports rest and recovery. The breath is one of the few conscious doorways into it. As you breathe out, the heart naturally slows a little. A 2018 review (Zaccaro and colleagues) concluded that slow breathing, around six breaths a minute, is associated with more parasympathetic activity and a greater sense of calm.',
        'Mindfulness also works from the side of the mind. In a 2007 study, Matthew Lieberman and colleagues showed that putting an emotion into words — "this is anger", "this is fear" — reduced activity in the amygdala, a region involved in the alarm response. It is exactly what many practices teach: notice and name what arises.',
        'The psychologists David Creswell and Emily Lindsay propose that mindfulness protects health mainly as a stress buffer: it changes how we appraise and respond to difficult situations, which over time lightens the load of stress on the body. The idea fits the studies, but is still being tested.',
        'In short: you cannot avoid stress, but you can train how you respond to it. Slow breathing calms the body; naming calms the mind.',
      ],
      practice:
        'When you feel stress rising, take a minute breathing with the out-breath longer than the in-breath — for example, breathe in for a count of four and out for a count of six.',
      related: ['calma-3', 'ancoragem-4', 'ansiedade-6'],
      sources: [SOURCES.zaccaro2018, SOURCES.lieberman2007, SOURCES.creswell2014],
    },
    {
      id: 'neuroplasticity',
      track: 'science',
      title: 'Meditation and neuroplasticity',
      summary: 'The brain changes with what we repeat. What that says about practice.',
      readingMinutes: 4,
      body: [
        'For a long time, the adult brain was thought to be more or less fixed. We now know it is not: it changes throughout life according to what we do, think and repeat. This capacity is called neuroplasticity. Connections used often grow stronger; those we stop using weaken.',
        'A classic example: in 2004, Bogdan Draganski and colleagues published a study in Nature in which adults learned to juggle over three months. Brain scans showed an increase in grey matter in areas involved in perceiving motion. Months after they stopped practising, the increase had shrunk. The brain follows what we practise — and what we stop practising.',
        'If meditation is training for attention, it is fair to ask whether it leaves traces in the brain too. In 2005, Sara Lazar and colleagues found a thicker cortex in regions tied to attention and to sensing the body, such as the insula, in experienced meditators. In 2011, Britta Hölzel and colleagues scanned people before and after the eight-week MBSR programme and reported increased grey matter density in regions such as the hippocampus, which is involved in memory and emotional regulation.',
        'But the story has an important chapter. In 2022, Tammi Kral and colleagues published two randomised trials in Science Advances, with more than two hundred participants — far larger than the earlier studies — and found no structural brain changes after eight weeks of MBSR. Small studies tend to find effects that do not hold up in larger samples. Today, the honest conclusion is that visible changes in brain structure after a few weeks of meditation are not established.',
        'What remains solid is the principle: the brain adapts to what we do repeatedly. Every time you notice a distraction and come back, you are exercising a mental habit. It does not take a brain scan for that to be worthwhile — but it is a good reason to think of practice as long-term training, not something that changes everything in eight weeks.',
      ],
      practice:
        'As with any training, regularity counts for more than length. This week, try sitting every day, even if only for five minutes.',
      related: ['respiracao-5'],
      sources: [SOURCES.draganski2004, SOURCES.lazar2005, SOURCES.holzel2011, SOURCES.kral2022],
    },
    {
      id: 'research-evidence',
      track: 'science',
      title: 'What the research shows',
      summary: 'Anxiety, depression and pain: the evidence, and its limits.',
      readingMinutes: 4,
      body: [
        'In 2014, Madhav Goyal and colleagues at Johns Hopkins University published one of the most cited reviews on the subject. They gathered 47 randomised controlled trials, with more than 3,500 participants, to answer a simple question: do meditation programmes help with stress and well-being?',
        'For mindfulness programmes, the answer was: there is moderate evidence of improvement in anxiety, depression and pain. The authors noted that the effect on depression is similar to what would be expected from antidepressants in a primary care population. For other outcomes — such as positive mood, attention and sleep — the evidence was low or insufficient. And meditation was not shown to be better than other active treatments, such as exercise or therapy.',
        'One of the most solid results is for Mindfulness-Based Cognitive Therapy (MBCT), designed for people with recurrent depression. A 2016 meta-analysis (Kuyken and colleagues), using individual data from more than a thousand patients, showed that those who took MBCT had fewer relapses in the following months than those who did not — including when compared with other active treatments. In the United Kingdom, MBCT is recommended in the official guidelines for recurrent depression.',
        'At the same time, Nicholas Van Dam and other researchers published a warning in 2018: enthusiasm for mindfulness has grown faster than the science. Many studies are small, the word "mindfulness" itself is used in different ways, and adverse effects are little studied. For some people — especially those with a history of trauma or serious mental health conditions — intensive practice can bring up difficult experiences.',
        'The balanced conclusion: meditation is a useful tool, with real and modest benefits, especially for anxiety, depression and pain. It is not a cure-all, and it does not replace treatment. If you are going through a hard time, practise alongside the care of a professional.',
      ],
      practice:
        'Before each sit this week, rate how you feel from 0 to 10. Afterwards, rate it again. Watching your own data is your small experiment.',
      related: ['ansiedade-6', 'respiracao-5'],
      sources: [SOURCES.goyal2014, SOURCES.kuyken2016, SOURCES.vanDam2018],
    },
  ],
};

export function libraryTracksFor(locale: Locale): LibraryTrack[] {
  return LIBRARY_TRACKS[locale];
}

export function lessonsFor(locale: Locale, track: LibraryTrackId): LibraryLesson[] {
  return LIBRARY_LESSONS[locale].filter((lesson) => lesson.track === track);
}

export function findLesson(locale: Locale, id: string): LibraryLesson | undefined {
  return LIBRARY_LESSONS[locale].find((lesson) => lesson.id === id);
}

export function findTrack(locale: Locale, id: string): LibraryTrack | undefined {
  return LIBRARY_TRACKS[locale].find((track) => track.id === id);
}
