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

export interface GuidedMeditation {
  id: string;
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
    id: "corpo-10",
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
    id: "respiracao-5",
    title: "Atenção na Respiração",
    description: "Cinco minutos descansando a atenção na respiração, e voltando para ela.",
    durationSeconds: 278,
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
        waitSeconds: 18,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 18,
      },
      {
        text: "Nada a alcançar.",
        source: require('@/assets/audios/speeches-luna/respiracao-5/luna-nada-a-alcancar.mp3'),
        audioSeconds: 1.588,
        waitSeconds: 18,
      },
      {
        text: null,
        source: null,
        audioSeconds: 0,
        waitSeconds: 15,
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
];

export function findMeditation(id: string): GuidedMeditation | undefined {
  return GUIDED_MEDITATIONS.find((m) => m.id === id);
}
