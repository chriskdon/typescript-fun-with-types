type TicTacToeChip = '❌' | '⭕';
type TicTacToeEndState = '❌ Won' | '⭕ Won' | 'Draw';
type TicTacToeState = TicTacToeChip | TicTacToeEndState;

type TicTacToeEmptyCell = '  '
type TicTacToeCell = TicTacToeChip | TicTacToeEmptyCell;

type TicTacToeYPositions = 'top' | 'middle' | 'bottom';
type TicTacToeXPositions = 'left' | 'center' | 'right';
type TicTacToePositions = `${TicTacToeYPositions}-${TicTacToeXPositions}`;

type TicTactToeBoard = TicTacToeCell[][];

type TicTacToeGame = {
  board: TicTactToeBoard;
  state: TicTacToeState;
};

type EmptyBoard = [
  ['  ', '  ', '  '],
  ['  ', '  ', '  '],
  ['  ', '  ', '  ']
];

type NewGame = {
  board: EmptyBoard;
  state: '❌';
};

type Invalid = 'invalid'
type NoWinnerYet = 'no-winner-yet'

type RowCells = [string, string, string];

type SetColumn<
  Row extends RowCells,
  Pos extends TicTacToeXPositions,
  Chip extends TicTacToeChip
> =
  Row extends [infer Left, infer Center, infer Right]
    ? [Pos, Left] extends ['left', TicTacToeEmptyCell] ? [Chip, Center, Right]
    : [Pos, Center] extends ['center', TicTacToeEmptyCell] ? [Left, Chip, Right]
    : [Pos, Right] extends ['right', TicTacToeEmptyCell] ? [Left, Center, Chip]
      : Invalid
    : never;

type SetPosition<
  Board extends TicTactToeBoard,
  Pos extends TicTacToePositions,
  Chip extends TicTacToeChip
> =
 Board extends [infer Top extends RowCells, infer Middle extends RowCells, infer Bottom extends RowCells]
  ? Pos extends `top-${infer XPos extends TicTacToeXPositions}` ? SetColumn<Top, XPos, Chip> extends Invalid ? Invalid : [SetColumn<Top, XPos, Chip>, Middle, Bottom]
  : Pos extends `middle-${infer XPos extends TicTacToeXPositions}` ? SetColumn<Middle, XPos, Chip> extends Invalid ? Invalid : [Top, SetColumn<Middle, XPos, Chip>, Bottom]
  : Pos extends `bottom-${infer XPos extends TicTacToeXPositions}` ? SetColumn<Bottom, XPos, Chip> extends Invalid ? Invalid : [Top, Middle, SetColumn<Bottom, XPos, Chip>]
    : never
  : never;

type Check<A extends string, B, C> =
  [A, B, C] extends [TicTacToeChip, TicTacToeChip, TicTacToeChip]
    ? [A, B, C] extends [A, A, A]
      ? `${A} Won`
      : false
    : false

type Winner<Board> =
 Board extends [
      [infer TL extends string, infer TC extends string, infer TR extends string],
      [infer ML extends string, infer MC, infer MR],
      [infer BL extends string, infer BC, infer BR]]

  ? (
     // Rows
     Check<TL, TC, TR> | Check<ML, MC, MR> | Check<BL, BC, BR> |

     // Columns
     Check<TL, ML, BL> | Check<TC, MC, BC> | Check<TR, MR, BR> |

     // Diagonals
     Check<TL, MC, BR> | Check<BL, MC, TR>) extends infer W
      ? W extends false
        // Draw
        ? (TL | TC | TR | ML | MC | MR | BL | BC | BR) extends TicTacToeChip
          ? 'Draw'

          // No Winner...yet
          : NoWinnerYet
        : W
      : never
  : never;

type T = Winner<[
  ['⭕', '❌', '⭕'],
    ['⭕', '❌', '❌'],
    ['❌', '⭕', '⭕']
]>;

type NextTurn<A extends TicTacToeChip> =
  A extends '❌' ? '⭕' : '❌'

type TicTacToe<Game, Pos extends TicTacToePositions> =
  Game extends { board: infer Board extends TicTactToeBoard, state: infer State extends TicTacToeChip}
    ? SetPosition<Board, Pos, State> extends infer NextBoard
      ? NextBoard extends Invalid
        ? { board: Board, state: State }
        : Winner<NextBoard> extends NoWinnerYet
          ? { board: NextBoard, state: NextTurn<State> }
          : { board: NextBoard, state: Winner<NextBoard> }
      : never
    : never