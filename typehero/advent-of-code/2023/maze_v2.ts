// --- Tuple/Matrix Utils ---

type Point = [number, number];

type GenTuple<N extends number, V = unknown, _Acc extends unknown[] = []> =
	_Acc['length'] extends N
		? _Acc
		: GenTuple<N, V, [V, ..._Acc]>

// Representing a Matrix as a map for faster get/set operations
type PointString = `${number},${number}`
type MatrixMap<T = unknown> = {
	map: Record<PointString, T>;

	// This is sort of weird to have but makes it easier to rebuild
	// the original structure as tuples.
	points: Point[][]
}

type AsPoint<P extends PointString> =
	P extends `${infer Row extends number},${infer Col extends number}`
		? [Row, Col]
		: never;

type AsMatrixKey<P extends Point> =
	P extends [infer Row extends number, infer Col extends number]
		? `${Row},${Col}`
		: never;

type _RowToColMap<Items extends unknown[], Row extends number, _Col extends number = 0> =
	Items extends [infer H, ...infer Rest]
		? { point: [Row, _Col]; value: H } | _RowToColMap<Rest, Row, Add<_Col, 1>>
		: never

type _MatrixToMatrixList<Matrix extends unknown[][], _Row extends number = 0> =
	Matrix extends [infer H extends unknown[], ...infer Rest extends unknown[][]]
		? _RowToColMap<H, _Row> | _MatrixToMatrixList<Rest, Add<_Row, 1>>
		: never;

type _GenRowPoints<Row extends number, Length extends number, Acc extends unknown[] = []> =
	Length extends Acc['length']
		? []
		: [[Row, Acc['length']], ..._GenRowPoints<Row, Length, [unknown, ...Acc]>];

type _MatrixListPoints<Matrix extends unknown[][], _Row extends number = 0> =
	Matrix extends [infer H extends unknown[], ...infer Rest extends unknown[][]]
		? [_GenRowPoints<_Row, H['length']>, ..._MatrixListPoints<Rest, Add<_Row, 1>>]
		: [];

type AsMatrixMap<
	Matrix extends unknown[][],
	_MatrixList extends { point: Point; value: unknown} = _MatrixToMatrixList<Matrix>,
	_Map = { [I in _MatrixList as AsMatrixKey<I['point']>]: I['value'] },
	_Points = _MatrixListPoints<Matrix>,
> = { map: _Map; points: _Points };

type MatrixSet<
	Matrix extends MatrixMap,
	P extends Point,
	Value,
	_MatrixKey extends PointString = AsMatrixKey<P>,
> =
	[unknown] extends [Matrix['map'][_MatrixKey]]
		? never
		: {
			map: { [K in keyof Matrix['map']]: K extends _MatrixKey ? Value : Matrix['map'][K] };
			points: Matrix['points']
		};

type _PointTupleToValues<Matrix extends MatrixMap, Points extends Point[]> =
	Points extends [infer P extends Point, ...infer Rest extends Point[]]
		? [MatrixAt<Matrix, P>, ..._PointTupleToValues<Matrix, Rest>]
		: [];

type AsMatrixTuple<
	Matrix extends MatrixMap,
	_Points extends Point[][] = Matrix['points']
> =
	_Points extends [infer RowPoints extends Point[], ...infer Rest extends Point[][]]
		? [_PointTupleToValues<Matrix, RowPoints>, ...AsMatrixTuple<Matrix, Rest>]
		: []

type MatrixFind<
	Matrix extends MatrixMap,
	Value,
	_Find = { [K in keyof Matrix['map']]: Matrix['map'][K] extends Value ? K : never },
> =
	_Find[keyof _Find] extends never
		? never
		: _Find[keyof _Find] extends `${infer Row extends number},${infer Col extends number}`
			? [Row, Col]
			: never

type MatrixAt<Matrix extends MatrixMap, P extends Point> =
	P extends [infer Row extends number, infer Col extends number]
		? Matrix['map'][`${Row},${Col}`]
		: never;

// --- Math Utils

type Add<X extends number, Y extends number> =
	[...GenTuple<X>, ...GenTuple<Y>]['length'] extends infer N extends number
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

type Alley = "  ";
type Santa = '🎅';
type MazeItem = "🎄" | Santa | Alley;
type DELICIOUS_COOKIES = "🍪";

type MazeMatrix = MazeItem[][];
type MazeMatrixMap = MatrixMap<MazeItem>;

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
	Maze extends MazeMatrixMap,
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

type MoveFromTo<Maze extends MazeMatrixMap, From extends Point, To extends Point> =
	MatrixSet<Maze, From, Alley> extends (infer U extends MazeMatrixMap)
		? MatrixSet<U, To, Santa>
		: never;

type HasEscaped<
	Maze extends MazeMatrixMap,
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
	_MazeMatrixMap extends MazeMatrixMap = AsMatrixMap<Maze>,
	_From extends Point = MatrixFind<_MazeMatrixMap, Santa>,
	_To extends Point = MovePoint<_From, Direction>,
	_CanMove = CanMove<_MazeMatrixMap, _To>,
	_HasEscaped = HasEscaped<_MazeMatrixMap>,
> =
	_HasEscaped extends true
		? WinMaze<Maze>
		: _CanMove extends true
			? MoveFromTo<_MazeMatrixMap, _From, _To> extends infer NextMaze extends MazeMatrixMap
				? AsMatrixTuple<NextMaze>
				: never
			: Maze

// Tests