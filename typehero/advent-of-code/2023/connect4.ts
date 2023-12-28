// --- Tuple/Matrix Utils ---

type Point = [number, number];

type GenTuple<N extends number, V = unknown, _Acc extends unknown[] = []> =
	_Acc['length'] extends N
		? _Acc
		: GenTuple<N, V, [V, ..._Acc]>

type TupleSet<
	Items extends unknown[],
	Index extends number, Value,
	_Acc extends unknown[] = [],
> =
	Items extends [infer H, ...infer Rest]
		? _Acc['length'] extends Index
				? [..._Acc, Value, ...Rest]
				: TupleSet<Rest, Index, Value, [..._Acc, H]>
		: never;

type TupleFindIndex<Items extends unknown[], Value, _Acc extends unknown[] = []> =
	Items extends [infer H, ...infer Rest]
		? H extends Value
			? _Acc['length']
			: TupleFindIndex<Rest, Value, [unknown, ..._Acc]>
		: never;

type MatrixSet<
	Matrix extends unknown[][],
	P extends Point,
	Value,
> =
		P extends [infer Row extends number, infer Col extends number]
			? TupleSet<Matrix[Row], Col, Value> extends infer U
				? U extends never ? never : TupleSet<Matrix, Row, U>
				: never
			: never;

type MatrixFind<Matrix extends unknown[][], Value, _Acc extends unknown[] = []> =
	Matrix extends [infer Row extends unknown[], ...infer Rest extends unknown[][]]
		? TupleFindIndex<Row, Value> extends infer C
			? [C] extends [never]
				? MatrixFind<Rest, Value, [unknown, ..._Acc]>
				: [_Acc['length'], C]
			: never
		: never;

type MatrixAt<Matrix extends unknown[][], P extends Point> =
  Matrix extends (infer Type)[][]
    ? P extends [infer Row extends number, infer Col extends number]
      ? Row extends never ? never
      : Col extends never ? never
      : Matrix[Row][Col] extends (infer I extends Type)
        ? I
        : never
		  : never
    : never;

// --- Math Utils

type Add<X extends number, Y extends number> =
  // length 'should' always be a number but in certain cases we need to
  // give the type checker some extra hints
	[...GenTuple<X>, ...GenTuple<Y>]['length'] extends (infer N extends number)
    ? N
    : never;

// M => minuend, S => subtrahend
type Subtract<M extends number, S extends number, _MT = GenTuple<M>, _ST = GenTuple<S>> =
	_MT extends [infer _MH, ...infer MRest]
		? _ST extends [infer _SH, ...infer SRest]
			? Subtract<M, S, MRest, SRest>
			: _MT['length']
		: _MT extends _ST ? 0 : never;

// --- Main ---

type Chips = "🔴" | "🟡";
type Empty = "  ";
type Connect4Cell = Chips | Empty;
type Connect4State = "🔴" | "🟡" | "🔴 Won" | "🟡 Won" | "Draw";

type MatrixBoard = Connect4Cell[][];

type GameState = { board: MatrixBoard; state: Connect4State };

type NewGame = { board: GenTuple<6, GenTuple<7, Empty>>; state: '🟡' };

type LastIndex<T extends unknown[]> =
  Subtract<T['length'], 1>

type EmptyColumnPoint<
	Board extends MatrixBoard,
	Column extends number,
	_Row extends number = LastIndex<Board>,
> =
	MatrixAt<Board, [_Row, Column]> extends infer V
    ? V extends Empty
      ? [_Row, Column]
      : _Row extends 0
        ? never
        : EmptyColumnPoint<Board, Column, Subtract<_Row, 1>>
    : never;

type PlayerChip<State extends GameState> =
  State['state'] extends (infer Chip extends '🟡' | '🔴')
    ? Chip
    : never;

type NextChip<State extends GameState> =
  PlayerChip<State> extends '🔴'
    ? '🟡'
  : PlayerChip<State> extends '🟡'
    ? '🔴'
  : never;

type DropChip<
  Board extends MatrixBoard,
  DropColumn extends number,
  Chip extends Chips,
> =
	EmptyColumnPoint<Board, DropColumn> extends (infer DropPoint extends Point)
    ? MatrixSet<Board, DropPoint, Chip> extends (infer U extends MatrixBoard)
      ? U
      : never
    : never;

type GenCheckPoints<RowMax extends number, ColMax extends number, _Row extends number = 0, _Col extends number = 0> =
  _Row extends RowMax
    ? _Col extends ColMax
      ? [[_Row, _Col]]
      : [[_Row, _Col], ...GenCheckPoints<RowMax, ColMax, _Row, Add<_Col, 1>>]
    : _Col extends ColMax
      ? [[_Row, _Col], ...GenCheckPoints<RowMax, ColMax, Add<_Row, 1>, 0>]
      : [[_Row, _Col], ...GenCheckPoints<RowMax, ColMax, _Row, Add<_Col, 1>>];

type GetForChecks<
  Board extends MatrixBoard,
  Row extends number, Col extends number
> =
  [
      // Vertical
      [
        MatrixAt<Board, [Row, Col]>,
        MatrixAt<Board, [Add<Row, 1>, Col]>,
        MatrixAt<Board, [Add<Row, 2>, Col]>,
        MatrixAt<Board, [Add<Row, 3>, Col]>
      ],
      // Horizontal
      [
        MatrixAt<Board, [Row, Col]>,
        MatrixAt<Board, [Row, Add<Col, 1>]>,
        MatrixAt<Board, [Row, Add<Col, 2>]>,
        MatrixAt<Board, [Row, Add<Col, 3>]>
      ],
      // Diagonal - Down
      [
        MatrixAt<Board, [Row, Col]>,
        MatrixAt<Board, [Add<Row, 1>, Add<Col, 1>]>,
        MatrixAt<Board, [Add<Row, 2>, Add<Col, 2>]>,
        MatrixAt<Board, [Add<Row, 3>, Add<Col, 3>]>
      ],
      // Diagonal - Up
      [
          MatrixAt<Board, [Row, Col]>,
          MatrixAt<Board, [Subtract<Row, 1>, Add<Col, 1>]>,
          MatrixAt<Board, [Subtract<Row, 2>, Add<Col, 2>]>,
          MatrixAt<Board, [Subtract<Row, 3>, Add<Col, 3>]>
      ]
    ];

type HasWon<
  Board extends MatrixBoard,
  Chip extends Chips,

  _RowMax extends number = LastIndex<Board>,
  _ColMax extends number = LastIndex<Board[0]>,
  _CheckPoints extends unknown[] = GenCheckPoints<_RowMax, _ColMax>,
> =
  _CheckPoints extends [[infer Row extends number, infer Col extends number], ...infer CheckPointsRest extends Point[]]
    ? [Chip, Chip, Chip, Chip] extends GetForChecks<Board, Row, Col>[number]
      ? true
      : HasWon<Board, Chip, _RowMax, _ColMax, CheckPointsRest>
    : false

type FullBoard<Board extends MatrixBoard> =
  Board[0][number] extends Chips ? true : false

type Connect4<
  State extends GameState,
  DropColumn extends number,
  _Board extends MatrixBoard = State['board'],
  _Chip extends Chips = PlayerChip<State>,
  _NextBoard extends MatrixBoard = DropChip<_Board, DropColumn, _Chip>,
  _HasWon = HasWon<_NextBoard, _Chip>,
> =
  _HasWon extends true
    ? { board: _NextBoard, state: `${_Chip} Won`}
    : FullBoard<_NextBoard> extends true
      ? { board: _NextBoard; state: 'Draw' }
      : { board: _NextBoard; state: NextChip<State> };
