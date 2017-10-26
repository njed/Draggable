import babel from 'rollup-plugin-babel'

export default {
	input: 'src/index.js',
	name: 'Draggable',
	plugins: [
		babel()
	],
	output: [
		{ file: 'dist/Draggable.cjs.js', format: 'cjs' },
		{ file: 'dist/Draggable.es.js', format: 'es' },
		{ file: 'dist/Draggable.iife.js', format: 'iife' }
	],
	sourcemap: true
};
