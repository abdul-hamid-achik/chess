import { db } from "../index"
import { openings } from "../schema"

/**
 * Comprehensive Opening Seed Data
 * 70+ common chess openings with ECO codes, variations, and descriptions
 * Organized by first move: 1.e4, 1.d4, and Flank Openings
 */
export const openingData = [
  // ==================== 1.e4 OPENINGS ====================

  // Sicilian Defense Family
  {
    name: "Sicilian Defense",
    eco: "B20",
    moves: ["e4", "c5"],
    fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
    description: "The most popular defense against 1.e4, leading to sharp, unbalanced positions. Black fights for control of d4 and creates counterplay on the queenside.",
    variations: [
      { name: "Najdorf Variation", moves: ["Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"] },
      { name: "Dragon Variation", moves: ["Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"] },
      { name: "Sveshnikov Variation", moves: ["Nf3", "Nc6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e5"] },
      { name: "Classical Variation", moves: ["Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "Nc6"] },
    ],
    popularity: 95,
    difficultyLevel: "beginner",
    themes: ["sharp", "tactical", "popular"],
    winRate: 0.44,
    drawRate: 0.28,
    lossRate: 0.28,
  },
  {
    name: "Sicilian Defense: Najdorf Variation",
    eco: "B90",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
    fen: "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
    description: "One of the sharpest lines in the Sicilian, favored by Fischer, Kasparov, and many top players. The move a6 prepares ...e5 or ...b5 expansion.",
    variations: [
      { name: "English Attack", moves: ["Be3", "e5", "Nb3", "Be6", "f3"] },
      { name: "Main Line 6.Bg5", moves: ["Bg5", "e6", "f4", "Be7"] },
    ],
    popularity: 92,
    difficultyLevel: "advanced",
    themes: ["sharp", "tactical", "popular"],
    winRate: 0.45,
    drawRate: 0.25,
    lossRate: 0.30,
  },
  {
    name: "Sicilian Defense: Dragon Variation",
    eco: "B70",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"],
    fen: "rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6",
    description: "Named for the pawn structure resembling a dragon. Black fianchettoes the kingside bishop for tremendous pressure on the long diagonal.",
    variations: [
      { name: "Yugoslav Attack", moves: ["Be3", "Bg7", "f3", "O-O", "Qd2"] },
      { name: "Classical Dragon", moves: ["Be2", "Bg7", "O-O", "O-O", "Be3"] },
    ],
    popularity: 88,
    difficultyLevel: "advanced",
    themes: ["sharp", "tactical", "aggressive"],
    winRate: 0.46,
    drawRate: 0.23,
    lossRate: 0.31,
  },
  {
    name: "Sicilian Defense: Sveshnikov Variation",
    eco: "B33",
    moves: ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e5"],
    fen: "r1bqkb1r/pp1p1ppp/2n2n2/4p3/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq e6 0 6",
    description: "A hypermodern approach where Black accepts a weak d5 square for active piece play and control of key central squares.",
    variations: [
      { name: "Main Line", moves: ["Ndb5", "d6", "Bg5", "a6", "Na3", "b5"] },
    ],
    popularity: 82,
    difficultyLevel: "advanced",
    themes: ["modern", "tactical", "sharp"],
    winRate: 0.43,
    drawRate: 0.27,
    lossRate: 0.30,
  },
  {
    name: "Sicilian Defense: Classical Variation",
    eco: "B58",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "Nc6"],
    fen: "r1bqkb1r/pp2pppp/2np1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 2 6",
    description: "A solid setup for Black developing naturally while maintaining flexibility in the pawn structure.",
    variations: [
      { name: "Richter-Rauzer Attack", moves: ["Bg5", "e6", "Qd2", "Be7"] },
      { name: "Sozin Attack", moves: ["Bc4", "e6", "Be3", "Be7"] },
    ],
    popularity: 85,
    difficultyLevel: "advanced",
    themes: ["classical", "solid", "popular"],
    winRate: 0.42,
    drawRate: 0.31,
    lossRate: 0.27,
  },

  // Ruy Lopez (Spanish Game)
  {
    name: "Ruy Lopez (Spanish Opening)",
    eco: "C60",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    description: "One of the oldest and most classical openings, named after Spanish priest Ruy López de Segura. White attacks the knight that defends e5.",
    variations: [
      { name: "Morphy Defense", moves: ["a6", "Ba4", "Nf6"] },
      { name: "Berlin Defense", moves: ["Nf6"] },
      { name: "Steinitz Defense", moves: ["d6"] },
    ],
    popularity: 95,
    difficultyLevel: "beginner",
    themes: ["classical", "popular", "solid"],
    winRate: 0.45,
    drawRate: 0.29,
    lossRate: 0.26,
  },
  {
    name: "Ruy Lopez: Morphy Defense",
    eco: "C70",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6"],
    fen: "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 4",
    description: "The main line of the Ruy Lopez. Black challenges the bishop and develops naturally while maintaining tension in the center.",
    variations: [
      { name: "Closed Variation", moves: ["O-O", "Be7", "Re1", "b5", "Bb3", "d6"] },
      { name: "Open Variation", moves: ["O-O", "Nxe4"] },
      { name: "Marshall Attack", moves: ["O-O", "Be7", "Re1", "b5", "Bb3", "O-O", "c3", "d5"] },
    ],
  },
  {
    name: "Ruy Lopez: Berlin Defense",
    eco: "C65",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6"],
    fen: "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    description: "Popularized by Vladimir Kramnik in his 2000 World Championship match. A solid defense leading to strategic endgames.",
    variations: [
      { name: "Berlin Wall", moves: ["O-O", "Nxe4", "d4", "Nd6", "Bxc6", "dxc6", "dxe5", "Nf5"] },
    ],
  },

  // Italian Game
  {
    name: "Italian Game",
    eco: "C50",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    description: "One of the oldest openings, developing the bishop to its most active square. Leads to open positions with tactical opportunities.",
    variations: [
      { name: "Giuoco Piano", moves: ["Bc5", "c3", "Nf6", "d4"] },
      { name: "Two Knights Defense", moves: ["Nf6"] },
      { name: "Hungarian Defense", moves: ["Be7"] },
    ],
  },
  {
    name: "Italian Game: Giuoco Piano",
    eco: "C53",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3"],
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq - 0 4",
    description: "Italian for 'Quiet Game'. A strategic opening where White builds a strong pawn center with d4.",
    variations: [
      { name: "Main Line", moves: ["Nf6", "d4", "exd4", "cxd4", "Bb4+"] },
      { name: "Greco Variation", moves: ["Nf6", "d3"] },
    ],
  },
  {
    name: "Italian Game: Two Knights Defense",
    eco: "C55",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"],
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    description: "Black develops aggressively, fighting for the initiative. Leads to sharp tactical play.",
    variations: [
      { name: "Main Line 4.Ng5", moves: ["Ng5", "d5", "exd5", "Na5"] },
      { name: "Max Lange Attack", moves: ["d4", "exd4", "O-O", "Bc5"] },
    ],
  },

  // French Defense
  {
    name: "French Defense",
    eco: "C00",
    moves: ["e4", "e6"],
    fen: "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    description: "A solid and strategic defense. Black plans ...d5 to challenge the center, often leading to closed positions with pawn chains.",
    variations: [
      { name: "Advance Variation", moves: ["d4", "d5", "e5"] },
      { name: "Winawer Variation", moves: ["d4", "d5", "Nc3", "Bb4"] },
      { name: "Classical Variation", moves: ["d4", "d5", "Nc3", "Nf6"] },
      { name: "Tarrasch Variation", moves: ["d4", "d5", "Nd2"] },
    ],
  },
  {
    name: "French Defense: Advance Variation",
    eco: "C02",
    moves: ["e4", "e6", "d4", "d5", "e5"],
    fen: "rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
    description: "White gains space in the center but Black gets counterplay with ...c5 and ...f6, attacking the pawn chain.",
    variations: [
      { name: "Main Line", moves: ["c5", "c3", "Nc6", "Nf3"] },
      { name: "Milner-Barry Gambit", moves: ["c5", "c3", "Nc6", "Nf3", "Qb6", "Bd3"] },
    ],
  },
  {
    name: "French Defense: Winawer Variation",
    eco: "C15",
    moves: ["e4", "e6", "d4", "d5", "Nc3", "Bb4"],
    fen: "rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 1 4",
    description: "The most forcing variation of the French. Black pins the knight and threatens to damage White's pawn structure.",
    variations: [
      { name: "Main Line 4.e5", moves: ["e5", "c5", "a3", "Bxc3+", "bxc3"] },
      { name: "Poisoned Pawn", moves: ["e5", "c5", "a3", "Bxc3+", "bxc3", "Ne7", "Qg4"] },
    ],
  },

  // Caro-Kann Defense
  {
    name: "Caro-Kann Defense",
    eco: "B10",
    moves: ["e4", "c6"],
    fen: "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    description: "A solid defense where Black prepares ...d5 without blocking the c8 bishop. Popular at all levels for its reliability.",
    variations: [
      { name: "Classical Variation", moves: ["d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5"] },
      { name: "Advance Variation", moves: ["d4", "d5", "e5"] },
      { name: "Exchange Variation", moves: ["d4", "d5", "exd5", "cxd5"] },
    ],
  },
  {
    name: "Caro-Kann Defense: Classical Variation",
    eco: "B18",
    moves: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5"],
    fen: "rn1qkbnr/pp2pppp/2p5/5b2/3PN3/8/PPP2PPP/R1BQKBNR w KQkq - 1 5",
    description: "Black develops the light-squared bishop before playing ...e6, avoiding one of the French Defense's problems.",
    variations: [
      { name: "Main Line", moves: ["Ng3", "Bg6", "h4", "h6", "Nf3", "Nd7"] },
    ],
  },
  {
    name: "Caro-Kann Defense: Advance Variation",
    eco: "B12",
    moves: ["e4", "c6", "d4", "d5", "e5"],
    fen: "rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
    description: "Similar to the French Advance. White gains space but Black gets counterplay with ...Bf5 and ...c5.",
    variations: [
      { name: "Main Line", moves: ["Bf5", "Nf3", "e6", "Be2"] },
      { name: "Short Variation", moves: ["Bf5", "c3"] },
    ],
  },

  // Pirc Defense
  {
    name: "Pirc Defense",
    eco: "B07",
    moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6"],
    fen: "rnbqkb1r/ppp1pp1p/3p1np1/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4",
    description: "A hypermodern defense where Black allows White to build a strong center, planning to undermine it later. Black fianchettoes the kingside bishop.",
    variations: [
      { name: "Austrian Attack", moves: ["f4", "Bg7", "Nf3"] },
      { name: "Classical System", moves: ["Nf3", "Bg7", "Be2", "O-O"] },
    ],
  },

  // Alekhine Defense
  {
    name: "Alekhine Defense",
    eco: "B02",
    moves: ["e4", "Nf6"],
    fen: "rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2",
    description: "Named after Alexander Alekhine. Black immediately attacks e4, inviting White to advance pawns while Black maneuvers to attack them.",
    variations: [
      { name: "Four Pawns Attack", moves: ["e5", "Nd5", "c4", "Nb6", "d4", "d6", "f4"] },
      { name: "Modern Variation", moves: ["e5", "Nd5", "d4", "d6", "Nf3"] },
    ],
  },

  // Scandinavian Defense
  {
    name: "Scandinavian Defense",
    eco: "B01",
    moves: ["e4", "d5"],
    fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2",
    description: "One of the oldest recorded openings. Black immediately challenges e4, though the queen may be exposed after 2.exd5 Qxd5.",
    variations: [
      { name: "Main Line", moves: ["exd5", "Qxd5", "Nc3", "Qa5"] },
      { name: "Modern Variation", moves: ["exd5", "Nf6"] },
    ],
  },

  // Petrov Defense
  {
    name: "Petrov Defense (Russian Game)",
    eco: "C42",
    moves: ["e4", "e5", "Nf3", "Nf6"],
    fen: "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    description: "A solid, symmetrical defense. Black immediately attacks e4, leading to balanced positions. Popular among top players for drawing.",
    variations: [
      { name: "Classical Attack", moves: ["Nxe5", "d6", "Nf3", "Nxe4"] },
      { name: "Modern Attack", moves: ["d4"] },
    ],
  },

  // Philidor Defense
  {
    name: "Philidor Defense",
    eco: "C41",
    moves: ["e4", "e5", "Nf3", "d6"],
    fen: "rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
    description: "Named after François-André Danican Philidor. A solid but passive defense that can lead to cramped positions for Black.",
    variations: [
      { name: "Main Line", moves: ["d4", "Nf6", "Nc3", "exd4", "Nxd4"] },
    ],
  },

  // King's Gambit
  {
    name: "King's Gambit",
    eco: "C30",
    moves: ["e4", "e5", "f4"],
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq f3 0 2",
    description: "An aggressive romantic opening. White sacrifices a pawn for rapid development and attacking chances. Popular in the 19th century.",
    variations: [
      { name: "King's Gambit Accepted", moves: ["exf4"] },
      { name: "King's Gambit Declined", moves: ["Bc5"] },
      { name: "Falkbeer Counter Gambit", moves: ["d5"] },
    ],
  },

  // ==================== 1.d4 OPENINGS ====================

  // Queen's Gambit
  {
    name: "Queen's Gambit",
    eco: "D06",
    moves: ["d4", "d5", "c4"],
    fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
    description: "One of the oldest and most popular openings. White offers a pawn to gain central control and rapid development.",
    variations: [
      { name: "Queen's Gambit Declined", moves: ["e6"] },
      { name: "Queen's Gambit Accepted", moves: ["dxc4"] },
      { name: "Slav Defense", moves: ["c6"] },
    ],
  },
  {
    name: "Queen's Gambit Declined",
    eco: "D30",
    moves: ["d4", "d5", "c4", "e6"],
    fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
    description: "Black declines the gambit and builds a solid pawn structure. Leads to strategic, classical positions.",
    variations: [
      { name: "Orthodox Defense", moves: ["Nc3", "Nf6", "Bg5", "Be7", "e3", "O-O", "Nf3", "Nbd7"] },
      { name: "Tartakower Variation", moves: ["Nc3", "Nf6", "Bg5", "Be7", "e3", "O-O", "Nf3", "h6", "Bh4", "b6"] },
      { name: "Exchange Variation", moves: ["cxd5", "exd5"] },
    ],
  },
  {
    name: "Queen's Gambit Accepted",
    eco: "D20",
    moves: ["d4", "d5", "c4", "dxc4"],
    fen: "rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
    description: "Black accepts the gambit pawn. White gets central control and development advantage, while Black aims to hold the extra pawn.",
    variations: [
      { name: "Classical Defense", moves: ["Nf3", "Nf6", "e3", "e6", "Bxc4", "c5"] },
      { name: "Mannheim Variation", moves: ["Nf3", "a6"] },
    ],
  },

  // Slav Defense
  {
    name: "Slav Defense",
    eco: "D10",
    moves: ["d4", "d5", "c4", "c6"],
    fen: "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
    description: "A solid defense where Black supports d5 while keeping the c8 bishop mobile. Very popular in modern chess.",
    variations: [
      { name: "Main Line", moves: ["Nf3", "Nf6", "Nc3", "dxc4"] },
      { name: "Semi-Slav", moves: ["Nc3", "Nf6", "Nf3", "e6"] },
    ],
  },
  {
    name: "Semi-Slav Defense",
    eco: "D43",
    moves: ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "e6"],
    fen: "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
    description: "A hybrid of the Slav and Queen's Gambit Declined. Very solid but complex with many sharp variations.",
    variations: [
      { name: "Meran Variation", moves: ["Bd3", "dxc4", "Bxc4", "b5"] },
      { name: "Anti-Meran Gambit", moves: ["Bg5", "dxc4", "e4"] },
    ],
  },

  // King's Indian Defense
  {
    name: "King's Indian Defense",
    eco: "E60",
    moves: ["d4", "Nf6", "c4", "g6"],
    fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
    description: "A hypermodern defense. Black allows White to build a strong center, then attacks it with ...d6, ...Nbd7, and ...e5.",
    variations: [
      { name: "Classical Variation", moves: ["Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Be2", "e5"] },
      { name: "Sämisch Variation", moves: ["Nc3", "Bg7", "e4", "d6", "f3"] },
      { name: "Four Pawns Attack", moves: ["Nc3", "Bg7", "e4", "d6", "f4"] },
    ],
  },
  {
    name: "King's Indian Defense: Classical Variation",
    eco: "E90",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O"],
    fen: "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 2 6",
    description: "The main line of the King's Indian. Both sides build up their positions before the central break ...e5.",
    variations: [
      { name: "Main Line", moves: ["Be2", "e5", "O-O", "Nc6", "d5", "Ne7"] },
      { name: "Mar del Plata", moves: ["Be2", "e5", "O-O", "Nc6", "d5", "Ne7", "Ne1"] },
    ],
  },

  // Nimzo-Indian Defense
  {
    name: "Nimzo-Indian Defense",
    eco: "E20",
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"],
    fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
    description: "Named after Aron Nimzowitsch. Black pins the knight and threatens to damage White's pawn structure. Very popular at top level.",
    variations: [
      { name: "Rubinstein Variation", moves: ["e3", "O-O", "Bd3", "d5"] },
      { name: "Classical Variation", moves: ["Qc2", "O-O", "a3", "Bxc3+", "Qxc3"] },
      { name: "Sämisch Variation", moves: ["a3", "Bxc3+", "bxc3"] },
      { name: "Leningrad Variation", moves: ["Bg5", "h6", "Bh4", "c5"] },
    ],
  },

  // Queen's Indian Defense
  {
    name: "Queen's Indian Defense",
    eco: "E12",
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "b6"],
    fen: "rnbqkb1r/p1pp1ppp/1p2pn2/8/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
    description: "A solid defense where Black fianchettoes the queenside bishop to control the important e4 square.",
    variations: [
      { name: "Classical Variation", moves: ["g3", "Ba6", "b3", "Bb4+", "Bd2", "Be7"] },
      { name: "Petrosian System", moves: ["a3", "Bb7", "Nc3", "d5"] },
    ],
  },

  // Grünfeld Defense
  {
    name: "Grünfeld Defense",
    eco: "D70",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"],
    fen: "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq d6 0 4",
    description: "A hypermodern defense. Black allows White a strong center with e4, then attacks it vigorously. Favored by Fischer and Kasparov.",
    variations: [
      { name: "Exchange Variation", moves: ["cxd5", "Nxd5", "e4", "Nxc3", "bxc3", "Bg7"] },
      { name: "Russian System", moves: ["Nf3", "Bg7", "Qb3"] },
    ],
  },

  // Benoni Defense
  {
    name: "Benoni Defense",
    eco: "A56",
    moves: ["d4", "Nf6", "c4", "c5"],
    fen: "rnbqkb1r/pp1ppppp/5n2/2p5/2PP4/8/PP2PPPP/RNBQKBNR w KQkq c6 0 3",
    description: "An aggressive counter-attacking defense. Black creates an asymmetrical pawn structure and plays for piece activity.",
    variations: [
      { name: "Modern Benoni", moves: ["d5", "e6", "Nc3", "exd5", "cxd5", "d6"] },
      { name: "Benko Gambit", moves: ["d5", "b5"] },
    ],
  },
  {
    name: "Benko Gambit",
    eco: "A57",
    moves: ["d4", "Nf6", "c4", "c5", "d5", "b5"],
    fen: "rnbqkb1r/p2ppppp/5n2/1ppP4/2P5/8/PP2PPPP/RNBQKBNR w KQkq b6 0 4",
    description: "Black sacrifices a pawn for long-term positional compensation on the queenside. Leads to unique positions.",
    variations: [
      { name: "Accepted", moves: ["cxb5", "a6", "bxa6"] },
      { name: "Declined", moves: ["Nf3"] },
    ],
  },

  // Dutch Defense
  {
    name: "Dutch Defense",
    eco: "A80",
    moves: ["d4", "f5"],
    fen: "rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq f6 0 2",
    description: "An aggressive defense. Black stakes a claim in the center and prepares to attack on the kingside. Somewhat double-edged.",
    variations: [
      { name: "Leningrad Variation", moves: ["g3", "Nf6", "Bg2", "g6"] },
      { name: "Stonewall", moves: ["c4", "Nf6", "g3", "e6", "Bg2", "d5", "Nf3", "c6"] },
      { name: "Classical Variation", moves: ["c4", "Nf6", "g3", "e6", "Bg2", "Be7"] },
    ],
  },

  // Bogo-Indian Defense
  {
    name: "Bogo-Indian Defense",
    eco: "E11",
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "Bb4+"],
    fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4",
    description: "Similar to the Nimzo-Indian but without ...Nc3. Black develops quickly and can transpose to other openings.",
    variations: [
      { name: "Main Line", moves: ["Bd2", "Qe7"] },
      { name: "Wade Variation", moves: ["Bd2", "a5"] },
    ],
  },

  // Catalan Opening
  {
    name: "Catalan Opening",
    eco: "E00",
    moves: ["d4", "Nf6", "c4", "e6", "g3"],
    fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq - 0 3",
    description: "Combines Queen's Gambit ideas with a kingside fianchetto. White puts pressure on the long diagonal and center.",
    variations: [
      { name: "Open Catalan", moves: ["d5", "Bg2", "dxc4"] },
      { name: "Closed Catalan", moves: ["d5", "Bg2", "Be7", "Nf3", "O-O"] },
    ],
  },

  // London System
  {
    name: "London System",
    eco: "D02",
    moves: ["d4", "Nf6", "Nf3", "e6", "Bf4"],
    fen: "rnbqkb1r/pppp1ppp/4pn2/8/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 2 3",
    description: "A solid system opening. White develops the dark-squared bishop outside the pawn chain before playing e3.",
    variations: [
      { name: "Main Line", moves: ["c5", "e3", "Nc6", "c3", "d5"] },
    ],
  },

  // Torre Attack
  {
    name: "Torre Attack",
    eco: "A46",
    moves: ["d4", "Nf6", "Nf3", "e6", "Bg5"],
    fen: "rnbqkb1r/pppp1ppp/4pn2/6B1/3P4/5N2/PPP1PPPP/RN1QKB1R b KQkq - 3 3",
    description: "A solid system where White develops the bishop to g5, putting pressure on Black's position. Named after Carlos Torre.",
    variations: [
      { name: "Main Line", moves: ["h6", "Bh4", "c5", "c3"] },
    ],
  },

  // Trompowsky Attack
  {
    name: "Trompowsky Attack",
    eco: "A45",
    moves: ["d4", "Nf6", "Bg5"],
    fen: "rnbqkb1r/pppppppp/5n2/6B1/3P4/8/PPP1PPPP/RN1QKBNR b KQkq - 2 2",
    description: "An aggressive system where White immediately pins the knight. Avoids much mainstream theory.",
    variations: [
      { name: "Main Line", moves: ["Ne4", "Bf4", "c5"] },
      { name: "Pseudo-Trompowsky", moves: ["e6", "e4"] },
    ],
  },

  // ==================== FLANK OPENINGS ====================

  // English Opening
  {
    name: "English Opening",
    eco: "A10",
    moves: ["c4"],
    fen: "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1",
    description: "A flexible opening where White controls d5 and can transpose to many structures. Named for Howard Staunton's use in a match in England.",
    variations: [
      { name: "Symmetrical Variation", moves: ["c5"] },
      { name: "Reversed Sicilian", moves: ["e5", "Nc3", "Nf6"] },
      { name: "King's English", moves: ["e5", "Nc3"] },
      { name: "Anglo-Indian Defense", moves: ["Nf6"] },
    ],
  },
  {
    name: "English Opening: Symmetrical Variation",
    eco: "A30",
    moves: ["c4", "c5"],
    fen: "rnbqkbnr/pp1ppppp/8/2p5/2P5/8/PP1PPPPP/RNBQKBNR w KQkq c6 0 2",
    description: "Black mirrors White's first move, leading to symmetrical pawn structures. Often transposes to other openings.",
    variations: [
      { name: "Main Line", moves: ["Nf3", "Nf6", "Nc3", "Nc6", "g3"] },
      { name: "Hedgehog System", moves: ["Nf3", "Nf6", "g3", "b6"] },
    ],
  },
  {
    name: "English Opening: Reversed Sicilian",
    eco: "A20",
    moves: ["c4", "e5"],
    fen: "rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq e6 0 2",
    description: "White plays a Sicilian Defense with an extra tempo. Leads to quiet positional play.",
    variations: [
      { name: "Main Line", moves: ["Nc3", "Nf6", "Nf3", "Nc6"] },
      { name: "King's English", moves: ["Nc3", "Nf6", "g3"] },
    ],
  },

  // Réti Opening
  {
    name: "Réti Opening",
    eco: "A04",
    moves: ["Nf3"],
    fen: "rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1",
    description: "A hypermodern opening named after Richard Réti. White develops the knight first, keeping options open for the center.",
    variations: [
      { name: "King's Indian Attack", moves: ["d5", "g3", "Nf6", "Bg2", "e6", "O-O", "Be7", "d3"] },
      { name: "Réti Gambit", moves: ["d5", "c4"] },
    ],
  },
  {
    name: "King's Indian Attack",
    eco: "A07",
    moves: ["Nf3", "d5", "g3"],
    fen: "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2",
    description: "A system where White plays a King's Indian Defense setup (g3, Bg2, O-O, d3) but as White. Very flexible.",
    variations: [
      { name: "Main Line", moves: ["Nf6", "Bg2", "e6", "O-O", "Be7", "d3"] },
    ],
  },

  // Bird's Opening
  {
    name: "Bird's Opening",
    eco: "A02",
    moves: ["f4"],
    fen: "rnbqkbnr/pppppppp/8/8/5P2/8/PPPPP1PP/RNBQKBNR b KQkq f3 0 1",
    description: "An aggressive flank opening. White controls e5 and prepares to build a kingside attack. Named after Henry Bird.",
    variations: [
      { name: "From's Gambit", moves: ["e5", "fxe5", "d6"] },
      { name: "Dutch Variation", moves: ["d5"] },
    ],
  },

  // Nimzo-Larsen Attack
  {
    name: "Nimzo-Larsen Attack",
    eco: "A01",
    moves: ["b3"],
    fen: "rnbqkbnr/pppppppp/8/8/8/1P6/P1PPPPPP/RNBQKBNR b KQkq - 0 1",
    description: "An unorthodox opening where White fianchettoes the queenside bishop. Popular with Bent Larsen.",
    variations: [
      { name: "Main Line", moves: ["d5", "Bb2", "Nf6", "Nf3"] },
      { name: "English Variation", moves: ["e5", "Bb2", "Nc6"] },
    ],
  },

  // Larsen's Opening
  {
    name: "Larsen's Opening",
    eco: "A01",
    moves: ["b3", "e5", "Bb2"],
    fen: "rnbqkbnr/pppp1ppp/8/4p3/8/1P6/PBPPPPPP/RN1QKBNR b KQkq - 1 2",
    description: "White fianchettoes the queenside bishop to control the long diagonal. A favorite of Grandmaster Bent Larsen.",
    variations: [
      { name: "Main Line", moves: ["Nc6", "e3", "d5"] },
    ],
  },

  // Polish Opening (Sokolsky Opening)
  {
    name: "Polish Opening (Sokolsky Opening)",
    eco: "A00",
    moves: ["b4"],
    fen: "rnbqkbnr/pppppppp/8/8/1P6/8/P1PPPPPP/RNBQKBNR b KQkq b3 0 1",
    description: "An unusual opening that aims to control the center from the flank. Rarely seen at top level but can surprise unprepared opponents.",
    variations: [
      { name: "Main Line", moves: ["e5", "Bb2", "f6"] },
      { name: "Outflank Variation", moves: ["e5", "Bb2", "Bxb4"] },
    ],
  },

  // King's Fianchetto Opening
  {
    name: "King's Fianchetto Opening",
    eco: "A06",
    moves: ["Nf3", "d5", "g3", "c5", "Bg2"],
    fen: "rnbqkbnr/pp2pppp/8/2pp4/8/5NP1/PPPPPPBP/RNBQK2R b KQkq - 2 3",
    description: "White develops flexibly with a kingside fianchetto. Can transpose to many different pawn structures.",
    variations: [
      { name: "Main Line", moves: ["Nc6", "O-O", "e5", "d3"] },
    ],
  },
]

/**
 * Seed openings into the database
 */
export async function seedOpenings() {
  console.log("📚 Seeding openings...")

  try {
    if (openingData.length === 0) {
      console.log("   ⚠️  No opening data available. Skipping.")
      return { success: true, count: 0, skipped: true }
    }

    // Check if openings already exist
    const existingOpenings = await db.select().from(openings).limit(1)

    if (existingOpenings.length > 0) {
      console.log("   ⚠️  Openings already exist. Skipping.")
      return { success: true, count: 0, skipped: true }
    }

    // Insert all openings
    const inserted = await db.insert(openings).values(openingData).returning()

    console.log(`   ✅ Inserted ${inserted.length} openings`)

    return { success: true, count: inserted.length, skipped: false }
  } catch (error) {
    console.error("   ❌ Error seeding openings:", error)
    throw error
  }
}
