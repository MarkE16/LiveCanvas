export type Option = {
	label: string;
	value: string;
};

export type CanvasFile = {
	archived: boolean;
	archivedDate: number | null;
	file: File;
};
