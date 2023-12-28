/** because "dashing" implies speed */
type Dasher = "💨";

/** representing dancing or grace */
type Dancer = "💃";

/** a deer, prancing */
type Prancer = "🦌";

/** a star for the dazzling, slightly mischievous Vixen */
type Vixen = "🌟";

/** for the celestial body that shares its name */
type Comet = "☄️";

/** symbolizing love, as Cupid is the god of love */
type Cupid = "❤️";

/** representing thunder, as "Donner" means thunder in German */
type Donner = "🌩️";

/** meaning lightning in German, hence the lightning bolt */
type Blitzen = "⚡";

/** for his famous red nose */
type Rudolph = "🔴";

type Reindeer = Dasher | Dancer | Prancer | Vixen | Comet | Cupid | Donner | Blitzen | Rudolph;

type RegionGrid = [[string, string, string], [string, string, string], [string, string, string]];
type Region = [
	string, string, string,
	string, string, string,
	string, string, string,
];

type Game = [
	RegionGrid, RegionGrid, RegionGrid,
	RegionGrid, RegionGrid, RegionGrid,
	RegionGrid, RegionGrid, RegionGrid,
]

type Concat<R extends unknown[]> =
	R extends [infer H extends unknown[], ...infer Rest]
		? [...H, ...Concat<Rest>]
		: [];

type Unionize<R> =
	R extends [infer H, ...infer Rest extends unknown[]]
		? H | Unionize<Rest>
		: never;

type ConcatRows<Rows extends unknown[]> =
	Rows extends [infer R extends unknown[], ...infer Rest extends unknown[][]]
		? [Concat<R>, ...ConcatRows<Rest>]
		: []

type RowsToColumn<
	Rows,
	Col extends string[] = [],
	NextRows extends string[][] = []
> =
	Rows extends [infer R extends string[], ...infer RowsRest extends string[][]]
		? R extends [infer C extends string, ...infer RowRest extends string[]]
			? RowsToColumn<RowsRest, [...Col, C], [...NextRows, RowRest]>
			: unknown
		: [Col, NextRows];

// This is needed so the type checker doesn't
// think RowsToColumns is infinite
type FiniteRows = [
	string[], string[]?, string[]?,
	string[]? , string[]?, string[]?,
	string[]?, string[]?, string[]?
];

type RowsToColumns<Rows extends FiniteRows> =
	RowsToColumn<Rows> extends [infer Col, infer NextRows extends FiniteRows]
		? [Col, ...RowsToColumns<NextRows>]
		: [];

type RegionsToColumns<Rows extends Region[]> =
	RowsToColumns<Rows extends infer CR extends FiniteRows ? CR : never>;

type ValidateRegion<R extends string[]> =
	Reindeer extends Unionize<R> ? true : false;

type ValidateRegions<G extends Region[]> =
	G extends [infer R extends Region, ...infer Rest extends Region[]]
		? ValidateRegion<R> extends true
			? ValidateRegions<Rest>
			: false
		: true;

type Squarify<R extends RegionGrid[]> =
	R extends [
		[infer TL, infer TC, infer TR],
		[infer ML, infer MC, infer MR],
		[infer BL, infer BC, infer BR],
		 ...infer Rest extends RegionGrid[]
	]
		? [[TL, ML, BL], [TC, MC, BC], [TR, MR, BR], ...Squarify<Rest>]
		: [];

type Cast<From, To> = From extends infer C extends To ? C : never;

type ValidateRows<G extends Game> =
	ValidateRegions<ConcatRows<G>>;

type ValidateColumns<G extends Game> =
	ValidateRegions<Cast<RegionsToColumns<ConcatRows<G>>, Region[]>>;

type ValidateSquares<G extends Game> =
	ValidateRegions<ConcatRows<Squarify<G>>>;

type Validate<G extends Game> =
	ValidateRows<G> & ValidateColumns<G> & ValidateSquares<G> extends true
		? true : false;
