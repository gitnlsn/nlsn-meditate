/**
 * GENERATED FILE - do not edit by hand.
 * Regenerate with: npm run meditations -- manifest
 */

/** A bundled asset, as returned by require(). expo-audio accepts this directly. */
export type AudioAsset = number;

export interface GuidedSegment {
  /** The spoken line, or null for a silence-only beat. Also used for captions. */
  text: string | null;
  source: AudioAsset | null;
  audioSeconds: number;
  /** Silence held after this segment. */
  waitSeconds: number;
}

export type GuidedCategoryId = "atencao" | "compaixao" | "dificeis" | "sono";

export interface GuidedCategory {
  id: GuidedCategoryId;
  title: string;
}

/** Section order for the list screen. */
export const GUIDED_CATEGORIES: GuidedCategory[] = [
  { id: "atencao", title: "Atenção Plena" },
  { id: "compaixao", title: "Compaixão" },
  { id: "dificeis", title: "Momentos Difíceis" },
  { id: "sono", title: "Sono" },
];

export interface GuidedMeditation {
  id: string;
  category: GuidedCategoryId;
  title: string;
  description: string;
  durationSeconds: number;
  leadInSeconds: number;
  leadOutSeconds: number;
  segments: GuidedSegment[];
}

export const GUIDED_MEDITATIONS: GuidedMeditation[] = [
  {
    id: "calma-3",
    category: "atencao",
    title: "Pausa de Três Minutos",
    description: "Uma pausa curta para o meio de um dia difícil.",
    durationSeconds: 176,
    leadInSeconds: 2,
    leadOutSeconds: 5,
    segments: [
      {
        text: "Onde quer que você esteja, apenas pare.",
        source: require('@/assets/audios/speeches-luna/calma-3/luna-calma-onde-quer-que-voce-esteja-apenas-pare.mp3'),
        audioSeconds: 3.344,
        waitSeconds: 5,
      },
      {
        text: "Deixe os ombros caírem.",
        source: require('@/assets/audios/speeches-luna/calma-3/luna-calma-deixe-os-ombros-cairem.mp3'),
        audioSeconds: 1.985,
        waitSeconds: 6,
      },
      {
        text: "Solte a mandíbula.",
        source: require('@/assets/audios/speeches-luna/calma-3/luna-calma-solte-a-madibula.mp3'),
        audioSeconds: 1.75,
        waitSeconds: 6,
      },
      {
        text: "Puxe o ar devagar.",
        source: require('@/assets/audios/speeches-luna/calma-3/luna-calma-puxe-o-ar-devagar.mp3'),
        audioSeconds: 1.933,
        waitSeconds: 4,
      },
      {
        text: "E solte, mais devagar ainda.",
        source: require('@/assets/audios/speeches-luna/calma-3/luna-calma-e-solte-mais-devagar-ainda.mp3'),
        audioSeconds: 3.526,
        waitSeconds: 8,
      },
      {
        text: "De novo. Inspire.",
        source: require('@/assets/audios/speeches-luna/calma-3/luna-calma-de-novo-inspire.mp3'),
        audioSeconds: 2.403,
        waitSeconds: 4,
      },
      {
        text: "E expire, sem pressa.",
        source: require('@/assets/audios/speeches-luna/calma-3/luna-calma-e-expire-sem-pressa.mp3'),
        audioSeconds: 2.168,
        waitSeconds: 8,
      },
      {
        text: "Agora deixe a respiração encontrar o ritmo dela.",
        source: require('@/assets/audios/speeches-luna/calma-3/luna-calma-agora-deixe-a-respiracao-encontrar-o-ritmo-dela.mp3'),
        audioSeconds: 4.18,
        waitSeconds: 10,
      },
      {
        text: "Perceba três coisas que você consegue sentir agora.",
        source: require('@/assets/audios/speeches-luna/calma-3/luna-calma-perceba-tres-coisas-que-voce-consegue-sentir-agora.mp3'),
        audioSeconds: 4.206,
        waitSeconds: 12,
      },
      {
        text: "O chão. A sua roupa. O ar na pele.",
        source: require('@/assets/audios/speeches-luna/calma-3/luna-calma-o-chao-a-sua-roupa-o-ar-na-pele.mp3'),
        audioSeconds: 5.616,
        waitSeconds: 14,
      },
      {
        text: "Você não precisa resolver nada nos próximos dois minutos.",
        source: require('@/assets/audios/speeches-luna/calma-3/luna-calma-voce-nao-precisa-resolver-nada-nos-proximos-dois-minutos.mp3'),
        audioSeconds: 4.728,
        waitSeconds: 12,
      },
      {
        text: "Apenas fique aqui.",
        source: require('@/assets/audios/speeches-luna/calma-3/luna-calma-apenas-fique-aqui.mp3'),
        audioSeconds: 2.038,
        waitSeconds: 15,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 10,
      },
      {
        text: "Puxe mais um ar, um pouco mais fundo.",
        source: require('@/assets/audios/speeches-luna/calma-3/luna-calma-puxe-mais-um-ar-um-pouco-mais-fundo.mp3'),
        audioSeconds: 4.127,
        waitSeconds: 5,
      },
      {
        text: "E leve isso com você.",
        source: require('@/assets/audios/speeches-luna/calma-3/luna-calma-e-leve-isso-com-voce.mp3'),
        audioSeconds: 1.985,
        waitSeconds: 6,
      },
    ],
  },
  {
    id: "respiracao-5",
    category: "atencao",
    title: "Atenção na Respiração",
    description: "Cinco minutos descansando a atenção na respiração, e voltando para ela.",
    durationSeconds: 300,
    leadInSeconds: 3,
    leadOutSeconds: 6,
    segments: [
      {
        text: "Vamos começar. Encontre uma posição que você consiga manter com conforto.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-vamos-comecar-encontre-uma-posicao-que-voce-consiga-manter-com-conforto.mp3'),
        audioSeconds: 4.849,
        waitSeconds: 6,
      },
      {
        text: "Deixe os olhos se fecharem.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-deixe-os-olhos-se-fecharem.mp3'),
        audioSeconds: 1.89,
        waitSeconds: 8,
      },
      {
        text: "Puxe um ar bem fundo.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-puxe-o-ar-bem-fundo.mp3'),
        audioSeconds: 1.697,
        waitSeconds: 4,
      },
      {
        text: "E solte devagar.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-e-solte-devagar.mp3'),
        audioSeconds: 1.562,
        waitSeconds: 8,
      },
      {
        text: "Agora deixe a respiração voltar ao normal. Não controle.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-agora-deixe-a-respiracao-voltar-ao-normal-nao-controle.mp3'),
        audioSeconds: 4.55,
        waitSeconds: 10,
      },
      {
        text: "Apenas perceba.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-apenas-perceba.mp3'),
        audioSeconds: 1.418,
        waitSeconds: 10,
      },
      {
        text: "Sinta o ar entrando pelo nariz.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-sinta-o-ar-entrando-pelo-nariz.mp3'),
        audioSeconds: 2.152,
        waitSeconds: 12,
      },
      {
        text: "Mais fresco na entrada.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-mais-fresco-na-entrada.mp3'),
        audioSeconds: 1.315,
        waitSeconds: 10,
      },
      {
        text: "Mais morno na saída.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-mais-morno-na-saida.mp3'),
        audioSeconds: 1.588,
        waitSeconds: 12,
      },
      {
        text: "Você não precisa respirar fundo. Apenas perceba o que já está acontecendo.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-voce-nao-precisa-respirar-fundo-apenas-perceba-o-que-ja-esta-acontecendo.mp3'),
        audioSeconds: 4.893,
        waitSeconds: 14,
      },
      {
        text: "Quando a mente se distrair, e ela vai, isso não é um erro.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-quando-a-mente-se-distrair-e-ela-vai-isso-nao-e-um-erro.mp3'),
        audioSeconds: 4.364,
        waitSeconds: 12,
      },
      {
        text: "Só perceba para onde ela foi, e volte para a respiração.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-so-perceba-para-onde-ela-foi-e-volte-para-a-respiracao.mp3'),
        audioSeconds: 4.09,
        waitSeconds: 15,
      },
      {
        text: "De volta para o ar na ponta do nariz.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-de-volta-para-o-ar-na-ponta-do-nariz.mp3'),
        audioSeconds: 2.681,
        waitSeconds: 15,
      },
      {
        text: "Descansando aqui.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-descansando-aqui.mp3'),
        audioSeconds: 1.332,
        waitSeconds: 23,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 23,
      },
      {
        text: "Nada a alcançar.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-nada-a-alcancar.mp3'),
        audioSeconds: 1.588,
        waitSeconds: 24,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 21,
      },
      {
        text: "Puxe mais um ar bem fundo.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-puxe-mais-um-ar-bem-fundo.mp3'),
        audioSeconds: 2.152,
        waitSeconds: 4,
      },
      {
        text: "E solte.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-e-solte.mp3'),
        audioSeconds: 1.119,
        waitSeconds: 8,
      },
      {
        text: "Quando estiver pronto, abra os olhos.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-quanto-estiver-pronto-abra-os-olhos.mp3'),
        audioSeconds: 2.955,
        waitSeconds: 6,
      },
    ],
  },
  {
    id: "corpo-10",
    category: "atencao",
    title: "Escaneamento Corporal",
    description: "Uma varredura lenta da atenção, do topo da cabeça até os pés.",
    durationSeconds: 589,
    leadInSeconds: 3,
    leadOutSeconds: 8,
    segments: [
      {
        text: "Encontre uma posição confortável, sentado ou deitado.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-encontre-uma-posicao-confortavel.mp3'),
        audioSeconds: 3.753,
        waitSeconds: 6,
      },
      {
        text: "Deixe os olhos se fecharem, com suavidade.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-deixe-os-olhos-se-fecharem-com-suavidade.mp3'),
        audioSeconds: 3.284,
        waitSeconds: 8,
      },
      {
        text: "Não há nada a fazer aqui além de perceber.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-nao-ha-nada-a-fazer-aqui-alem-de-perceber.mp3'),
        audioSeconds: 3.32,
        waitSeconds: 10,
      },
      {
        text: "Comece puxando o ar devagar pelo nariz. E deixe sair.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-comece-puxando-o-ar-devagar-pelo-nariz-e-deixe-sair.mp3'),
        audioSeconds: 4.908,
        waitSeconds: 8,
      },
      {
        text: "Deixe a respiração encontrar o ritmo dela.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-deixe-a-respiracao-encontrar-o-ritmo-dela.mp3'),
        audioSeconds: 3.194,
        waitSeconds: 12,
      },
      {
        text: "Agora leve a atenção para o topo da cabeça.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-agora-leve-a-atencao-para-o-topo-da-cabeca.mp3'),
        audioSeconds: 3.41,
        waitSeconds: 12,
      },
      {
        text: "Perceba qualquer sensação ali. Calor. Formigamento. Ou nada.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-perceba-qualquer-sensacao-ali-ou-nada.mp3'),
        audioSeconds: 5.973,
        waitSeconds: 12,
      },
      {
        text: "Deixe a atenção descer para a testa, e para o espaço entre as sobrancelhas.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-deixe-a-atencao-descer-para-a-testa.mp3'),
        audioSeconds: 4.98,
        waitSeconds: 12,
      },
      {
        text: "Se encontrar tensão ali, deixe amolecer.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-se-encontrar-tensao-ali-deixe-amolecer.mp3'),
        audioSeconds: 2.869,
        waitSeconds: 12,
      },
      {
        text: "Desça para a mandíbula.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-desca-para-a-mandibula.mp3'),
        audioSeconds: 1.855,
        waitSeconds: 8,
      },
      {
        text: "Deixe os dentes se afastarem um pouco. Deixe a mandíbula solta.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-deixe-os-dentes-se-afastarem-um-pouco-deixe-a-mandibula-solta.mp3'),
        audioSeconds: 4.006,
        waitSeconds: 12,
      },
      {
        text: "Agora o pescoço, e a garganta.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-agora-o-pescoco-e-a-garganta.mp3'),
        audioSeconds: 2.743,
        waitSeconds: 12,
      },
      {
        text: "Deixe os ombros caírem, longe das orelhas.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-deixe-os-ombros-cairem-longe-das-orelhas.mp3'),
        audioSeconds: 3.41,
        waitSeconds: 12,
      },
      {
        text: "Sinta o peso dos braços.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-sinta-o-peso-dos-bracos.mp3'),
        audioSeconds: 1.985,
        waitSeconds: 12,
      },
      {
        text: "Até embaixo, pelos cotovelos, até as mãos.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-ate-embaixo-pelos-cotovelos-ate-as-maos.mp3'),
        audioSeconds: 3.591,
        waitSeconds: 12,
      },
      {
        text: "Perceba a ponta dos dedos.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-perceba-a-ponta-dos-dedos.mp3'),
        audioSeconds: 2.111,
        waitSeconds: 12,
      },
      {
        text: "Leve a atenção para o peito.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-leve-a-atencao-para-o-peito.mp3'),
        audioSeconds: 1.913,
        waitSeconds: 10,
      },
      {
        text: "Sinta ele subir, e descer, sem mudar nada.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-sinta-ele-subir-e-descer-sem-mudar-nada.mp3'),
        audioSeconds: 3.157,
        waitSeconds: 15,
      },
      {
        text: "Deixe a atenção descansar na barriga.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-deixe-a-atencao-descansar-na-barriga.mp3'),
        audioSeconds: 2.27,
        waitSeconds: 12,
      },
      {
        text: "Amoleça aqui.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-amoreca-aqui.mp3'),
        audioSeconds: 1.498,
        waitSeconds: 12,
      },
      {
        text: "Agora as costas. Toda a extensão da coluna.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-agora-as-costas-toda-a-extensao-da-coluna.mp3'),
        audioSeconds: 3.557,
        waitSeconds: 12,
      },
      {
        text: "Perceba onde o corpo encosta na superfície embaixo de você.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-perceba-onde-o-corpo-encosta-na-superficie-debaixo-de-voce.mp3'),
        audioSeconds: 3.487,
        waitSeconds: 15,
      },
      {
        text: "Deixe ela te sustentar.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-deixe-ela-te-sustentar.mp3'),
        audioSeconds: 1.977,
        waitSeconds: 12,
      },
      {
        text: "Leve a atenção para os quadris.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-leve-a-atencao-para-os-quadris.mp3'),
        audioSeconds: 2.223,
        waitSeconds: 12,
      },
      {
        text: "Desça pelas coxas.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-desca-pelas-coxas.mp3'),
        audioSeconds: 2.223,
        waitSeconds: 12,
      },
      {
        text: "Os joelhos.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-os-joelhos.mp3'),
        audioSeconds: 1.463,
        waitSeconds: 12,
      },
      {
        text: "As panturrilhas.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-as-panturrilhas.mp3'),
        audioSeconds: 1.638,
        waitSeconds: 12,
      },
      {
        text: "Desça até os tornozelos, e os pés.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-desca-ate-os-tornozelos-e-os-pes.mp3'),
        audioSeconds: 2.363,
        waitSeconds: 12,
      },
      {
        text: "Perceba os dedos dos pés.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-perceba-os-dedos-dos-pes.mp3'),
        audioSeconds: 1.802,
        waitSeconds: 12,
      },
      {
        text: "Agora deixe a atenção se abrir, para incluir o corpo inteiro de uma vez.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-agora-deixe-a-atencao-se-abrir-para-incluir-o-corpo-inteiro-de-uma-vez.mp3'),
        audioSeconds: 4.598,
        waitSeconds: 15,
      },
      {
        text: "Descansando aqui. Respirando.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-descansando-aqui-respirando.mp3'),
        audioSeconds: 2.586,
        waitSeconds: 18,
      },
      {
        text: "Nada para consertar. Nada para alcançar.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-nada-para-consertar-nada-para-alcancar.mp3'),
        audioSeconds: 3.405,
        waitSeconds: 20,
      },
      {
        text: "Fique com isso.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-fique-com-isso.mp3'),
        audioSeconds: 1.346,
        waitSeconds: 25,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 20,
      },
      {
        text: "Daqui a pouco vamos terminar.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-daqui-a-pouco-vamos-terminar.mp3'),
        audioSeconds: 2.375,
        waitSeconds: 10,
      },
      {
        text: "Comece a perceber os sons ao seu redor.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-comece-a-perceber-os-sons-ao-seu-redor.mp3'),
        audioSeconds: 2.598,
        waitSeconds: 12,
      },
      {
        text: "Deixe a respiração ficar um pouco mais profunda.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-deixe-a-respiracao-ficar-um-pouco-mais-profunda.mp3'),
        audioSeconds: 3.147,
        waitSeconds: 10,
      },
      {
        text: "E quando estiver pronto, abra os olhos.",
        source: require('@/assets/audios/speeches-luna/corpo-10/luna-e-quando-estiver-pronto-abra-os-olhos.mp3'),
        audioSeconds: 3.429,
        waitSeconds: 8,
      },
    ],
  },
  {
    id: "compaixao-3",
    category: "compaixao",
    title: "Um Momento de Compaixão",
    description: "Uma pausa curta para quando você está sendo duro consigo mesmo.",
    durationSeconds: 186,
    leadInSeconds: 2,
    leadOutSeconds: 5,
    segments: [
      {
        text: "Pare por um instante.",
        source: require('@/assets/audios/speeches-luna/compaixao-3/luna-compaixao-pare-por-um-instante.mp3'),
        audioSeconds: 1.933,
        waitSeconds: 5,
      },
      {
        text: "Deixe os olhos se fecharem, se for confortável.",
        source: require('@/assets/audios/speeches-luna/compaixao-3/luna-compaixao-deixe-os-olhos-se-fecharem-se-for-confortavel.mp3'),
        audioSeconds: 3.605,
        waitSeconds: 6,
      },
      {
        text: "Perceba como você está agora. Sem julgar.",
        source: require('@/assets/audios/speeches-luna/compaixao-3/luna-compaixao-perceba-como-voce-esta-agora-sem-julgar.mp3'),
        audioSeconds: 4.493,
        waitSeconds: 10,
      },
      {
        text: "Talvez haja algo difícil aqui. Um cansaço. Uma preocupação.",
        source: require('@/assets/audios/speeches-luna/compaixao-3/luna-compaixao-talvez-haja-algo-dificil-aqui-um-cansaco-uma-preocupacao.mp3'),
        audioSeconds: 7.236,
        waitSeconds: 10,
      },
      {
        text: "Você não precisa consertar isso agora.",
        source: require('@/assets/audios/speeches-luna/compaixao-3/luna-compaixao-voce-nao-precisa-consertar-isso-agora.mp3'),
        audioSeconds: 3.187,
        waitSeconds: 8,
      },
      {
        text: "Coloque uma mão sobre o peito, se quiser.",
        source: require('@/assets/audios/speeches-luna/compaixao-3/luna-compaixao-coloque-uma-mao-sobre-o-peito-se-quiser.mp3'),
        audioSeconds: 3.37,
        waitSeconds: 6,
      },
      {
        text: "Sinta o calor da sua própria mão.",
        source: require('@/assets/audios/speeches-luna/compaixao-3/luna-compaixao-sinta-o-calor-da-sua-propria-mao.mp3'),
        audioSeconds: 2.743,
        waitSeconds: 10,
      },
      {
        text: "E diga para você mesmo, em silêncio:",
        source: require('@/assets/audios/speeches-luna/compaixao-3/luna-compaixao-e-diga-para-voce-mesmo-em-silencio.mp3'),
        audioSeconds: 3.579,
        waitSeconds: 4,
      },
      {
        text: "Isso é difícil.",
        source: require('@/assets/audios/speeches-luna/compaixao-3/luna-compaixao-isso-e-dificil.mp3'),
        audioSeconds: 1.75,
        waitSeconds: 6,
      },
      {
        text: "Momentos difíceis fazem parte de uma vida.",
        source: require('@/assets/audios/speeches-luna/compaixao-3/luna-compaixao-momentos-dificeis-fazem-parte-de-uma-vida.mp3'),
        audioSeconds: 3.762,
        waitSeconds: 8,
      },
      {
        text: "Que eu possa ser gentil comigo neste momento.",
        source: require('@/assets/audios/speeches-luna/compaixao-3/luna-compaixao-que-eu-possa-ser-gentil-comigo-neste-momento.mp3'),
        audioSeconds: 3.997,
        waitSeconds: 10,
      },
      {
        text: "Repita, no seu tempo.",
        source: require('@/assets/audios/speeches-luna/compaixao-3/luna-compaixao-repita-no-seu-tempo.mp3'),
        audioSeconds: 2.325,
        waitSeconds: 12,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 20,
      },
      {
        text: "Perceba que você acabou de oferecer a si mesmo o que ofereceria a um amigo.",
        source: require('@/assets/audios/speeches-luna/compaixao-3/luna-compaixao-perceba-que-voce-acabou-de-oferecer-a-si-o-que-ofereceria-a-um-amigo.mp3'),
        audioSeconds: 6.217,
        waitSeconds: 8,
      },
      {
        text: "Quando estiver pronto, abra os olhos.",
        source: require('@/assets/audios/speeches-luna/compaixao-3/luna-compaixao-quando-estiver-pronto-abra-os-olhos.mp3'),
        audioSeconds: 3.526,
        waitSeconds: 4,
      },
    ],
  },
  {
    id: "autocompaixao-7",
    category: "compaixao",
    title: "Autocompaixão",
    description: "Sete minutos oferecendo a si mesmo a gentileza que você ofereceria a quem você ama.",
    durationSeconds: 428,
    leadInSeconds: 3,
    leadOutSeconds: 6,
    segments: [
      {
        text: "Encontre uma posição confortável, e deixe os olhos se fecharem.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-encontre-uma-posicao-confortavel-e-deixe-os-olhos-se-fecharem.mp3'),
        audioSeconds: 5.329,
        waitSeconds: 6,
      },
      {
        text: "Comece sentindo a respiração, sem mudar nada nela.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-comece-sentindo-a-respiracao-sem-mudar-nada-nela.mp3'),
        audioSeconds: 4.728,
        waitSeconds: 10,
      },
      {
        text: "Deixe o corpo assentar.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-deixe-o-corpo-assentar.mp3'),
        audioSeconds: 1.907,
        waitSeconds: 12,
      },
      {
        text: "Agora traga à mente alguém que gosta muito de você.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-agora-traga-a-mente-alguem-que-goste-muito-de-voce.mp3'),
        audioSeconds: 4.624,
        waitSeconds: 10,
      },
      {
        text: "Pode ser alguém de hoje, ou de muito tempo atrás.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-pode-ser-alguem-de-hoje-ou-de-muito-tempo-atras.mp3'),
        audioSeconds: 4.676,
        waitSeconds: 8,
      },
      {
        text: "Imagine essa pessoa olhando para você com afeto.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-imagine-essa-pessoa-olhando-para-voce-com-afeto.mp3'),
        audioSeconds: 4.441,
        waitSeconds: 15,
      },
      {
        text: "Perceba o que acontece no corpo quando você imagina isso.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-perceba-o-que-acontece-no-corpo-quando-voce-imagina-isso.mp3'),
        audioSeconds: 4.31,
        waitSeconds: 16,
      },
      {
        text: "Agora vamos virar essa mesma atenção para dentro.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-agora-vamos-virar-essa-mesma-atencao-para-dentro.mp3'),
        audioSeconds: 4.31,
        waitSeconds: 10,
      },
      {
        text: "Traga à mente você mesmo. Como você está hoje.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-traga-a-mente-voce-mesmo-como-voce-esta-hoje.mp3'),
        audioSeconds: 4.911,
        waitSeconds: 12,
      },
      {
        text: "Ofereça a si mesmo estas palavras, no seu tempo.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-ofereca-a-si-mesmo-estas-palavras-no-seu-tempo.mp3'),
        audioSeconds: 5.198,
        waitSeconds: 8,
      },
      {
        text: "Que eu esteja em segurança.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-que-eu-esteja-em-seguranca.mp3'),
        audioSeconds: 2.22,
        waitSeconds: 12,
      },
      {
        text: "Que eu tenha saúde.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-que-eu-tenha-saude.mp3'),
        audioSeconds: 1.855,
        waitSeconds: 12,
      },
      {
        text: "Que eu seja gentil comigo.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-que-eu-seja-gentil-comigo.mp3'),
        audioSeconds: 2.22,
        waitSeconds: 12,
      },
      {
        text: "Que eu viva com tranquilidade.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-que-eu-viva-com-tranquilidade.mp3'),
        audioSeconds: 2.455,
        waitSeconds: 15,
      },
      {
        text: "Repita as palavras que fizerem sentido para você.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-repita-as-palavras-que-fizerem-sentido-para-voce.mp3'),
        audioSeconds: 3.997,
        waitSeconds: 20,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 25,
      },
      {
        text: "Se vier resistência, isso é normal.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-se-vier-resistencia-isso-e-normal.mp3'),
        audioSeconds: 3.109,
        waitSeconds: 10,
      },
      {
        text: "Não force. A resistência também merece gentileza.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-nao-force-a-resistencia-tambem-merece-gentileza.mp3'),
        audioSeconds: 5.616,
        waitSeconds: 15,
      },
      {
        text: "Volte para as palavras quando quiser.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-volte-para-as-palavras-quando-quiser.mp3'),
        audioSeconds: 2.952,
        waitSeconds: 20,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 25,
      },
      {
        text: "Que eu esteja em segurança. Que eu tenha saúde.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-que-eu-esteja-em-seguranca-que-eu-tenha-saude.mp3'),
        audioSeconds: 5.094,
        waitSeconds: 15,
      },
      {
        text: "Que eu seja gentil comigo.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-que-eu-seja-gentil-comigo-2.mp3'),
        audioSeconds: 2.168,
        waitSeconds: 15,
      },
      {
        text: "Agora deixe as palavras irem embora.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-agora-deixe-as-palavras-irem-embora.mp3'),
        audioSeconds: 3.161,
        waitSeconds: 10,
      },
      {
        text: "Fique apenas com o que ficou no corpo.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-fique-apenas-com-o-que-ficou-no-corpo.mp3'),
        audioSeconds: 3.291,
        waitSeconds: 15,
      },
      {
        text: "Quando estiver pronto, abra os olhos.",
        source: require('@/assets/audios/speeches-luna/autocompaixao-7/luna-autocompaixao-quando-estiver-pronto-abra-os-olhos.mp3'),
        audioSeconds: 3.709,
        waitSeconds: 5,
      },
    ],
  },
  {
    id: "bondade-12",
    category: "compaixao",
    title: "Bondade Amorosa",
    description: "Doze minutos oferecendo boa vontade — a você, a quem você ama, a quem você mal conhece, e a quem é difícil.",
    durationSeconds: 720,
    leadInSeconds: 3,
    leadOutSeconds: 8,
    segments: [
      {
        text: "Sente-se de um jeito que você consiga manter por um tempo.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-sente-se-de-um-jeito-que-voce-consiga-manter-por-um-tempo.mp3'),
        audioSeconds: 5.46,
        waitSeconds: 6,
      },
      {
        text: "Deixe os olhos se fecharem.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-deixe-os-olhos-se-fecharem.mp3'),
        audioSeconds: 2.22,
        waitSeconds: 8,
      },
      {
        text: "Três respirações mais lentas, para começar.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-tres-respiracoes-mais-lentas-para-comecar.mp3'),
        audioSeconds: 3.944,
        waitSeconds: 10,
      },
      {
        text: "E depois deixe a respiração seguir sozinha.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-e-depois-deixe-a-respiracao-seguir-sozinha.mp3'),
        audioSeconds: 4.127,
        waitSeconds: 12,
      },
      {
        text: "Nesta prática vamos oferecer boa vontade. Primeiro para você, depois para outras pessoas.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-nessa-pratica-vamos-oferecer-boa-vontate.mp3'),
        audioSeconds: 9.43,
        waitSeconds: 8,
      },
      {
        text: "Não é preciso sentir nada em especial. A intenção basta.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-nao-e-preciso-sentir-nada-em-especial.mp3'),
        audioSeconds: 5.93,
        waitSeconds: 12,
      },
      {
        text: "Comece com você mesmo.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-comece-com-voce-mesmo.mp3'),
        audioSeconds: 2.09,
        waitSeconds: 6,
      },
      {
        text: "Que eu esteja em segurança.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-que-eu-esteja-em-seguranca.mp3'),
        audioSeconds: 2.168,
        waitSeconds: 12,
      },
      {
        text: "Que eu tenha saúde.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-que-eu-tenha-saude.mp3'),
        audioSeconds: 1.802,
        waitSeconds: 12,
      },
      {
        text: "Que eu viva com tranquilidade.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-que-eu-viva-com-tranquilidade.mp3'),
        audioSeconds: 2.638,
        waitSeconds: 15,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 20,
      },
      {
        text: "Repita no seu ritmo.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-repita-no-seu-ritmo.mp3'),
        audioSeconds: 2.09,
        waitSeconds: 10,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 20,
      },
      {
        text: "Agora traga à mente alguém de quem você gosta.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-agora-traga-a-mente-alguem-de-quem-voce-gosta.mp3'),
        audioSeconds: 4.362,
        waitSeconds: 12,
      },
      {
        text: "Veja essa pessoa à sua frente, do jeito que ela é.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-veja-essa-pessoa-a-sua-frente-do-jeito-como-ela-e.mp3'),
        audioSeconds: 3.892,
        waitSeconds: 15,
      },
      {
        text: "Que você esteja em segurança.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-que-voce-esteja-em-seguranca.mp3'),
        audioSeconds: 2.534,
        waitSeconds: 12,
      },
      {
        text: "Que você tenha saúde.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-que-voce-tenha-saude.mp3'),
        audioSeconds: 2.168,
        waitSeconds: 12,
      },
      {
        text: "Que você viva com tranquilidade.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-que-voce-viva-com-tranquilidade.mp3'),
        audioSeconds: 2.926,
        waitSeconds: 15,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 25,
      },
      {
        text: "Agora pense em alguém neutro.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-agora-pense-em-alguem-neutro.mp3'),
        audioSeconds: 2.769,
        waitSeconds: 10,
      },
      {
        text: "Alguém que você vê, mas não conhece. Alguém do mercado, da rua.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-alguem-que-voce-ve-mas-nao-conhece.mp3'),
        audioSeconds: 6.87,
        waitSeconds: 12,
      },
      {
        text: "Essa pessoa também quer ser feliz, como você.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-essa-pessoa-tambem-quer-ser-feliz-como-voce.mp3'),
        audioSeconds: 4.31,
        waitSeconds: 15,
      },
      {
        text: "Que você esteja em segurança.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-que-voce-esteja-em-seguranca-2.mp3'),
        audioSeconds: 2.691,
        waitSeconds: 12,
      },
      {
        text: "Que você tenha saúde.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-que-voce-tenha-saude-2.mp3'),
        audioSeconds: 2.168,
        waitSeconds: 12,
      },
      {
        text: "Que você viva com tranquilidade.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-que-voce-viva-com-tranquilidade-2.mp3'),
        audioSeconds: 3.004,
        waitSeconds: 15,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 24,
      },
      {
        text: "Agora, se você se sentir pronto, pense em alguém difícil.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-agora-se-voce-se-sentir-pronto-pense-em-alguem-dificil.mp3'),
        audioSeconds: 6.818,
        waitSeconds: 15,
      },
      {
        text: "Não precisa ser a pessoa mais difícil da sua vida. Comece pequeno.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-não-precisa-ser-a-pessoa-mais-dificil-da-sua-vida.mp3'),
        audioSeconds: 6.949,
        waitSeconds: 12,
      },
      {
        text: "Oferecer boa vontade não é concordar com o que aconteceu.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-oferecer-boa-vontade-nao-e-concordar-com-o-que-aconteceu.mp3'),
        audioSeconds: 4.833,
        waitSeconds: 12,
      },
      {
        text: "É só desejar que o sofrimento diminua.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-e-so-desejar-que-o-sofrimento-diminua.mp3'),
        audioSeconds: 3.109,
        waitSeconds: 12,
      },
      {
        text: "Que você esteja em segurança.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-que-voce-esteja-em-seguranca-3.mp3'),
        audioSeconds: 2.691,
        waitSeconds: 15,
      },
      {
        text: "Que você tenha saúde.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-que-voce-tenha-saude-3.mp3'),
        audioSeconds: 2.09,
        waitSeconds: 15,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 20,
      },
      {
        text: "Se for muito, volte para você mesmo. Isso também é a prática.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-se-for-muito-volte-para-voce-mesmo.mp3'),
        audioSeconds: 6.635,
        waitSeconds: 15,
      },
      {
        text: "Agora deixe a atenção se abrir.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-agora-deixe-a-atencao-se-abrir.mp3'),
        audioSeconds: 3.161,
        waitSeconds: 10,
      },
      {
        text: "Você, essa pessoa, e todas as outras.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-voce-essa-pessoa-e-todas-as-outras.mp3'),
        audioSeconds: 4.911,
        waitSeconds: 15,
      },
      {
        text: "Que todos estejam em segurança.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-que-todos-estejam-em-seguranca.mp3'),
        audioSeconds: 3.161,
        waitSeconds: 15,
      },
      {
        text: "Que todos vivam com tranquilidade.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-que-todos-vivam-com-tranquilidade.mp3'),
        audioSeconds: 3.056,
        waitSeconds: 18,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 25,
      },
      {
        text: "Fique aqui um momento.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-fique-aqui-um-momento.mp3'),
        audioSeconds: 1.985,
        waitSeconds: 15,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 15,
      },
      {
        text: "E quando estiver pronto, abra os olhos.",
        source: require('@/assets/audios/speeches-luna/bondade-12/luna-bondade-e-quando-estiver-pronto-abra-os-olhos.mp3'),
        audioSeconds: 4.258,
        waitSeconds: 5,
      },
    ],
  },
  {
    id: "ancoragem-4",
    category: "dificeis",
    title: "Ancoragem",
    description: "Quatro minutos para sair da espiral e voltar para o lugar onde você está. De olhos abertos.",
    durationSeconds: 250,
    leadInSeconds: 3,
    leadOutSeconds: 5,
    segments: [
      {
        text: "Você pode manter os olhos abertos nesta prática.",
        source: require('@/assets/audios/speeches-luna/ancoragem-4/luna-ancoragem-voce-pode-manter-os-olhos-abertos-nessa-pratica.mp3'),
        audioSeconds: 4.362,
        waitSeconds: 6,
      },
      {
        text: "Comece sentindo os pés no chão. O peso do corpo na cadeira ou no chão.",
        source: require('@/assets/audios/speeches-luna/ancoragem-4/luna-ancoragem-comece-sentindo-os-pes-no-chao.mp3'),
        audioSeconds: 7.523,
        waitSeconds: 12,
      },
      {
        text: "Agora olhe ao redor e encontre cinco coisas que você consegue ver. Sem pressa.",
        source: require('@/assets/audios/speeches-luna/ancoragem-4/luna-ancoragem-agora-olhe-ao-redor.mp3'),
        audioSeconds: 8.202,
        waitSeconds: 25,
      },
      {
        text: "Agora quatro coisas que você consegue tocar. A roupa, a cadeira, o ar na pele.",
        source: require('@/assets/audios/speeches-luna/ancoragem-4/luna-ancoragem-agora-4-coisas-que-voce-consegue-tocar.mp3'),
        audioSeconds: 9.038,
        waitSeconds: 25,
      },
      {
        text: "Agora três sons. Perto ou longe.",
        source: require('@/assets/audios/speeches-luna/ancoragem-4/luna-ancoragem-agora-3-sons.mp3'),
        audioSeconds: 4.859,
        waitSeconds: 25,
      },
      {
        text: "Dois cheiros, se houver. Ou apenas o ar entrando pelo nariz.",
        source: require('@/assets/audios/speeches-luna/ancoragem-4/luna-ancoragem-dois-cheiros-se-houver.mp3'),
        audioSeconds: 6.922,
        waitSeconds: 20,
      },
      {
        text: "E um sabor. Ou só a sensação da boca.",
        source: require('@/assets/audios/speeches-luna/ancoragem-4/luna-ancoragem-e-um-sabor.mp3'),
        audioSeconds: 4.598,
        waitSeconds: 20,
      },
      {
        text: "Perceba onde você está agora. Neste lugar, neste momento.",
        source: require('@/assets/audios/speeches-luna/ancoragem-4/luna-ancoragem-perceba-onde-voce-esta-agora.mp3'),
        audioSeconds: 6.4,
        waitSeconds: 25,
      },
      {
        text: "O corpo está aqui. Você está aqui.",
        source: require('@/assets/audios/speeches-luna/ancoragem-4/luna-ancoragem-o-corpo-esta-aqui.mp3'),
        audioSeconds: 4.362,
        waitSeconds: 20,
      },
      {
        text: "Quando quiser, siga com o seu dia.",
        source: require('@/assets/audios/speeches-luna/ancoragem-4/luna-ancoragem-quando-quiser-siga-com-o-seu-dia.mp3'),
        audioSeconds: 3.187,
        waitSeconds: 5,
      },
    ],
  },
  {
    id: "ansiedade-6",
    category: "dificeis",
    title: "Quando a Ansiedade Chega",
    description: "Seis minutos para fazer espaço para a ansiedade, em vez de tentar empurrá-la para longe.",
    durationSeconds: 369,
    leadInSeconds: 3,
    leadOutSeconds: 6,
    segments: [
      {
        text: "Esta prática não vai tirar a ansiedade. Vamos apenas fazer espaço para ela.",
        source: require('@/assets/audios/speeches-luna/ansiedade-6/luna-ansiedade-esta-pratica-nao-vai-tirar-a-ansiedade.mp3'),
        audioSeconds: 8.124,
        waitSeconds: 10,
      },
      {
        text: "Sente-se ou fique em pé, do jeito que estiver.",
        source: require('@/assets/audios/speeches-luna/ansiedade-6/luna-ansiedade-sente-se-ou-fique-em-pe.mp3'),
        audioSeconds: 4.441,
        waitSeconds: 8,
      },
      {
        text: "Comece alongando a expiração. Puxe o ar, e solte mais devagar do que puxou.",
        source: require('@/assets/audios/speeches-luna/ansiedade-6/luna-ansiedade-comece-alongando-a-expiracao.mp3'),
        audioSeconds: 7.889,
        waitSeconds: 15,
      },
      {
        text: "De novo. Solte devagar.",
        source: require('@/assets/audios/speeches-luna/ansiedade-6/luna-ansiedade-de-novo-solte-devagar.mp3'),
        audioSeconds: 2.455,
        waitSeconds: 20,
      },
      {
        text: "Agora perceba onde a ansiedade está no corpo. O peito, a garganta, a barriga.",
        source: require('@/assets/audios/speeches-luna/ansiedade-6/luna-ansiedade-agora-perceba-onde-a-ansiedade-esta-no-corpo.mp3'),
        audioSeconds: 8.908,
        waitSeconds: 40,
      },
      {
        text: "Não tente mudar. Só repare no formato dela.",
        source: require('@/assets/audios/speeches-luna/ansiedade-6/luna-ansiedade-nao-tente-mudar-so-repare-no-formato-dela.mp3'),
        audioSeconds: 4.728,
        waitSeconds: 40,
      },
      {
        text: "Se puder, diga em silêncio: isso é ansiedade, e ela vai passar.",
        source: require('@/assets/audios/speeches-luna/ansiedade-6/luna-ansiedade-se-puder-diga-em-silencio.mp3'),
        audioSeconds: 8.307,
        waitSeconds: 40,
      },
      {
        text: "Ansiedade é uma sensação, não é uma previsão.",
        source: require('@/assets/audios/speeches-luna/ansiedade-6/luna-ansiedade-ansiedade-e-uma-sensacao.mp3'),
        audioSeconds: 5.146,
        waitSeconds: 45,
      },
      {
        text: "Volte para a respiração longa. Puxe, e solte devagar.",
        source: require('@/assets/audios/speeches-luna/ansiedade-6/luna-ansiedade-volte-para-a-respiracao-longa.mp3'),
        audioSeconds: 6.922,
        waitSeconds: 38,
      },
      {
        text: "Você não precisa que ela vá embora para continuar o seu dia.",
        source: require('@/assets/audios/speeches-luna/ansiedade-6/luna-ansiedade-voce-nao-precisa-que-ela-va-embora-para-continuar-o-seu-dia.mp3'),
        audioSeconds: 4.78,
        waitSeconds: 30,
      },
      {
        text: "Quando estiver pronto, olhe ao redor e volte.",
        source: require('@/assets/audios/speeches-luna/ansiedade-6/luna-ansiedade-quando-estiver-pronto-olhe-ao-redor-e-volte.mp3'),
        audioSeconds: 4.545,
        waitSeconds: 8,
      },
    ],
  },
  {
    id: "sono-15",
    category: "sono",
    title: "Corpo em Repouso",
    description: "Quinze minutos para soltar o corpo e adormecer. Não termina — apenas se afasta.",
    durationSeconds: 913,
    leadInSeconds: 5,
    leadOutSeconds: 30,
    segments: [
      {
        text: "Deite-se confortavelmente. Deixe o corpo pesar no colchão.",
        source: require('@/assets/audios/speeches-luna/sono-15/luna-sono-deite-se-confortavemente.mp3'),
        audioSeconds: 6.504,
        waitSeconds: 15,
      },
      {
        text: "Não há mais nada para resolver hoje.",
        source: require('@/assets/audios/speeches-luna/sono-15/luna-sono-nao-ha-mais-nada-para-resolver-hoje.mp3'),
        audioSeconds: 3.187,
        waitSeconds: 20,
      },
      {
        text: "Deixe os olhos se fecharem, e a respiração seguir sozinha.",
        source: require('@/assets/audios/speeches-luna/sono-15/luna-sono-deixe-os-olhos-se-fecharem.mp3'),
        audioSeconds: 5.512,
        waitSeconds: 25,
      },
      {
        text: "Sinta o peso da cabeça no travesseiro. Solte o rosto, a testa, a mandíbula.",
        source: require('@/assets/audios/speeches-luna/sono-15/luna-sono-sinta-o-peso-da-cabeca-no-travesseiro.mp3'),
        audioSeconds: 8.777,
        waitSeconds: 35,
      },
      {
        text: "Deixe os ombros afundarem. Sinta os braços pesados, até a ponta dos dedos.",
        source: require('@/assets/audios/speeches-luna/sono-15/luna-sono-deixe-os-ombros-afundarem.mp3'),
        audioSeconds: 7.001,
        waitSeconds: 40,
      },
      {
        text: "Sinta o peito subindo e descendo. Sem mudar nada.",
        source: require('@/assets/audios/speeches-luna/sono-15/luna-sono-sinta-o-peito-subindo-e-descendo.mp3'),
        audioSeconds: 5.251,
        waitSeconds: 45,
      },
      {
        text: "Solte a barriga. Solte as costas contra a cama.",
        source: require('@/assets/audios/speeches-luna/sono-15/luna-sono-solte-a-barriga.mp3'),
        audioSeconds: 5.616,
        waitSeconds: 50,
      },
      {
        text: "Deixe os quadris pesarem. As pernas. Os pés.",
        source: require('@/assets/audios/speeches-luna/sono-15/luna-sono-deixe-os-quadris-pesarem.mp3'),
        audioSeconds: 6.087,
        waitSeconds: 60,
      },
      {
        text: "O corpo inteiro entregue, pesado, sustentado.",
        source: require('@/assets/audios/speeches-luna/sono-15/luna-sono-o-corpo-inteiro-entregue.mp3'),
        audioSeconds: 4.18,
        waitSeconds: 70,
      },
      {
        text: "Se a mente for para o dia de amanhã, tudo bem. Amanhã ainda não chegou.",
        source: require('@/assets/audios/speeches-luna/sono-15/luna-sono-se-a-mente-for-para-o-dia-de-amanha.mp3'),
        audioSeconds: 7.184,
        waitSeconds: 80,
      },
      {
        text: "Volte para o peso do corpo.",
        source: require('@/assets/audios/speeches-luna/sono-15/luna-sono-volte-para-o-peso-do-corpo.mp3'),
        audioSeconds: 2.351,
        waitSeconds: 90,
      },
      {
        text: "Nada a fazer. Nada a esperar.",
        source: require('@/assets/audios/speeches-luna/sono-15/luna-sono-nada-a-fazer.mp3'),
        audioSeconds: 3.762,
        waitSeconds: 100,
      },
      {
        text: "Descanse.",
        source: require('@/assets/audios/speeches-luna/sono-15/luna-sono-descanse.mp3'),
        audioSeconds: 1.489,
        waitSeconds: 120,
      },
      {
        text: "Só descanse.",
        source: require('@/assets/audios/speeches-luna/sono-15/luna-sono-so-descanse.mp3'),
        audioSeconds: 1.384,
        waitSeconds: 60,
      },
    ],
  },
];

export function findMeditation(id: string): GuidedMeditation | undefined {
  return GUIDED_MEDITATIONS.find((m) => m.id === id);
}

/** The list screen's sections, already ordered, with empty ones dropped. */
export function meditationsByCategory(): { category: GuidedCategory; items: GuidedMeditation[] }[] {
  return GUIDED_CATEGORIES
    .map((category) => ({
      category,
      items: GUIDED_MEDITATIONS.filter((m) => m.category === category.id),
    }))
    .filter((section) => section.items.length > 0);
}
