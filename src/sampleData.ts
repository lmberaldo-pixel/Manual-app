import { EquipmentProject } from './types';

export const INITIAL_SAMPLE_PROJECT: EquipmentProject = {
  id: 'project-3d-printer-hypercore',
  name: 'Montagem de Impressora 3D HyperCore v2',
  subtitle: 'Guia sequencial técnico para montagem mecânica, calibração e cabeamento',
  coverImage: '/src/assets/images/cover_equipment_3dprinter_1790907056807.jpg',
  category: 'Máquina de Chave',
  difficulty: 'Intermediário',
  estimatedHours: '3h 30min',
  generalDescription: 'Manual completo e sequencial para a montagem de bancada da estrutura, conjunto cinemático CoreXY, tracionamento de correias e cabeamento de precisão da impressora 3D.',
  toolsRequired: [
    'Chave Allen (2mm, 2.5mm, 3mm, 4mm)',
    'Alicate de corte diagonal e bico fino',
    'Esquadro de precisão 90°',
    'Fita métrica ou paquímetro digital',
    'Abraçadeiras plásticas (enforca-gato)',
    'Trava-rosca de torque médio (azul)'
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  steps: [
    {
      id: 'step-1-frame',
      stepNumber: 1,
      title: 'Estrutura Base e Montagem dos Perfis de Alumínio',
      subtitle: 'Alinhamento com esquadro 90° e aperto das cantoneiras estruturais M5',
      mainImage: '/src/assets/images/step1_frame_assembly_1790907066457.jpg',
      additionalImages: [
        {
          id: 'sub-img-1-1',
          url: '/src/assets/images/cover_equipment_3dprinter_1790907056807.jpg',
          caption: 'Visão geral da bancada nivelada com os 4 perfis inferiores'
        }
      ],
      description: 'Posicione os quatro perfis de alumínio anodizado V-Slot 2020 sobre uma superfície de bancada totalmente plana. Insira as porcas T deslizantes nas ranhuras antes de posicionar as cantoneiras em L. Utilize o esquadro de precisão em cada um dos quatro cantos para assegurar que os ângulos permaneçam em exatamente 90 graus antes do torque final com a chave Allen 4mm.',
      tools: ['Chave Allen 4mm', 'Esquadro de precisão', '8x Parafusos M5x10'],
      warning: 'Não aperte completamente os parafusos antes de checar a ortogonalidade dos 4 cantos para evitar empenamento do chassi.',
      tip: 'Aperte os parafusos em cruz (diagonal) para distribuir a tensão uniformemente.',
      estimatedMinutes: 25,
      checkpoints: [
        { id: 'c1', text: 'Conferir se a base não possui jogo apoiada na mesa', completed: false },
        { id: 'c2', text: 'Verificar esquadro em todos os quatro vértices internos', completed: false },
        { id: 'c3', text: 'Aplicar aperto firme em todos os 16 parafusos M5', completed: false }
      ]
    },
    {
      id: 'step-2-motors',
      stepNumber: 2,
      title: 'Instalação dos Motores de Passo NEMA 17 e Correias',
      subtitle: 'Fixação nos suportes antivibração e ajuste de tensão da correia dentada GT2',
      mainImage: '/src/assets/images/step2_stepper_motor_1790907076976.jpg',
      additionalImages: [],
      description: 'Acople os dois motores de passo NEMA 17 nos suportes traseiros de alumínio utilizando parafusos M3x8 e arruelas de pressão. Encaixe a polia de sincronismo de 20 dentes no eixo do motor com o chanfro voltado para o parafuso de fixação sem cabeça. Passe a correia dentada reforçada com fibra de vidro pelos tensionadores frontais mantendo uma deflexão máxima de 4mm ao pressionar no centro.',
      tools: ['Chave Allen 2mm e 2.5mm', 'Trava-rosca azul', 'Tensionador manual'],
      warning: 'Certifique-se de que a polia dentada não fique raspando na carcaça metálica do motor.',
      tip: 'Uma correia bem tensionada soa como uma nota musical grave ao ser dedilhada.',
      estimatedMinutes: 35,
      checkpoints: [
        { id: 'c4', text: 'Garantir aperto firme nos dois parafusos sem cabeça da polia dentada', completed: false },
        { id: 'c5', text: 'Checar movimento suave dos eixos sem pontos duros', completed: false },
        { id: 'c6', text: 'Validar simetria da tensão entre as correias esquerda e direita', completed: false }
      ]
    },
    {
      id: 'step-3-extruder',
      stepNumber: 3,
      title: 'Montagem do Bloco Extrusor e Chicote Elétrico',
      subtitle: 'Fixação do hotend no carro X e terminação organizada dos cabos de sinal',
      mainImage: '/src/assets/images/step3_wiring_extruder_1790907087392.jpg',
      additionalImages: [],
      description: 'Prenda o suporte do extrusor direto no carro de rolamentos lineares MGN12. Conecte o cartucho aquecedor de 40W e o termistor NTC 100k no bloco dissipador, aplicando pasta térmica nas roscas. Encape todos os fios do cabeçote com malha náutica expansível de 10mm e prenda nas guias de alívio de tensão usando abraçadeiras plásticas.',
      tools: ['Chave de fenda de precisão', 'Alicate de corte', 'Abraçadeiras plásticas', 'Pasta térmica de boro'],
      warning: 'Nunca puxe os fios do termistor pelo isolamento; são extremamente frágeis e podem quebrar internamente.',
      tip: 'Deixe uma folga calculada no cabo para que o cabeçote se mova livremente até os limites máximos sem esticar a fiação.',
      estimatedMinutes: 40,
      checkpoints: [
        { id: 'c7', text: 'Testar se o carro desliza livremente pelo trilho linear', completed: false },
        { id: 'c8', text: 'Fixar o chicote elétrico garantindo que não encoste nas partes móveis', completed: false },
        { id: 'c9', text: 'Conferir polaridade dos conectores antes de plugar na placa mãe', completed: false }
      ]
    }
  ]
};
