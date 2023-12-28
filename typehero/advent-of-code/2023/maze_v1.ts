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
	P extends [infer Row extends number, infer Col extends number]
		? Matrix[Row][Col]
		: never;

// --- Math Utils

type Add<X extends number, Y extends number> =
	[...GenTuple<X>, ...GenTuple<Y>]['length'];

// M => minuend, S => subtrahend
type Subtract<M extends number, S extends number, _MT = GenTuple<M>, _ST = GenTuple<S>> =
	_MT extends [infer _MH, ...infer MRest]
		? _ST extends [infer _SH, ...infer SRest]
			? Subtract<M, S, MRest, SRest>
			: _MT['length']
		: _MT extends _ST ? 0 : never;

// --- Main ---

type Alley = "  ";
type Santa = '🎅';
type MazeItem = "🎄" | Santa | Alley;
type DELICIOUS_COOKIES = "🍪";
type MazeMatrix = MazeItem[][];
type Directions = "up" | "down" | "left" | "right";

type MatchDirection<
	Direction extends Directions,
	Up, Down, Left, Right,
> =
	Direction extends 'up'
		? Up
	: Direction extends 'down'
		? Down
	: Direction extends 'left'
		? Left
	: Direction extends 'right'
		? Right
	: never;

type CanMove<
	Maze extends MazeMatrix,
	To extends Point,
	_AtPoint = MatrixAt<Maze, To>,
> = _AtPoint extends Alley ? true : false;

type MovePoint<From extends Point, Direction extends Directions> =
	From extends [infer Row extends number, infer Column extends number]
		? MatchDirection<
				Direction,
				/* Up */    [Subtract<Row, 1>, Column],
				/* Down */  [Add<Row, 1>, Column],
				/* Left */  [Row, Subtract<Column, 1>],
				/* Right */ [Row, Add<Column, 1>]
			>
		: never;

type MoveFromTo<Maze extends MazeMatrix, From extends Point, To extends Point> =
	MatrixSet<Maze, From, Alley> extends (infer U extends MazeMatrix)
		? MatrixSet<U, To, Santa>
		: never;

type HasEscaped<
	Maze extends MazeMatrix,
	_SantaPoint extends Point = MatrixFind<Maze, Santa>,
> =
	_SantaPoint extends [0, number] | [number, 0] ? true : false

type WinMaze<Maze extends unknown[][]> =
	Maze extends [infer Row extends unknown[], ...infer Rest extends unknown[][]]
		? [GenTuple<Row['length'], DELICIOUS_COOKIES>, ...WinMaze<Rest>]
		: [];

type Move<
	Maze extends MazeMatrix,
	Direction extends Directions,
	_From extends Point = MatrixFind<Maze, Santa>,
	_To extends Point = MovePoint<_From, Direction>,
	_CanMove = CanMove<Maze, _To>,
	_HasEscaped = HasEscaped<Maze>,
> =
	_HasEscaped extends true
		? WinMaze<Maze>
		: _CanMove extends true
			? MoveFromTo<Maze, _From, _To> extends infer NextMaze extends MazeMatrix
				? NextMaze
				: never
			: Maze