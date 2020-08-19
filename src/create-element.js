import { assign } from './util';
import { options } from './options';

/**
 * Create an virtual node (used for JSX)
 * @param {import('./internal').VNode["type"]} type The node name or Component
 * constructor for this virtual node
 * @param {object | null | undefined} [props] The properties of the virtual node
 * @param {Array<import('.').ComponentChildren>} [children] The children of the virtual node
 * @returns {import('./internal').VNode}
 */
export function createElement(type, props, children) {
	let i;
	props = assign({}, props);

	if (arguments.length > 3) {
		children = [children];
		// https://github.com/preactjs/preact/issues/1916
		for (i = 3; i < arguments.length; i++) {
			children.push(arguments[i]);
		}
	}

	if (children != null) {
		props.children = children;
	}

	// If a Component VNode, check for and apply defaultProps
	// Note: type may be undefined in development, must never error here.
	if (typeof type == 'function' && type.defaultProps != null) {
		for (i in type.defaultProps) {
			if (props[i] === undefined) {
				props[i] = type.defaultProps[i];
			}
		}
	}

	return createVNode(type, props);
}

/**
 * Create a VNode (used internally by Preact)
 * @param {import('./internal').VNode["type"]} type The node name or Component
 * Constructor for this virtual node
 * @param {object | string | number | null} props The properties of this virtual node.
 * If this virtual node represents a text node, this is the text of the node (string or number).
 * @returns {import('./internal').VNode}
 */
export function createVNode(type, props) {
	// V8 seems to be better at detecting type shapes if the object is allocated from the same call site
	// Do not inline into createElement and coerceToVNode!
	const vnode = {
		type,
		props,
		constructor: undefined
	};

	if (options.vnode) options.vnode(vnode);

	return {
		type,
		props,
		constructor: undefined
	};
}

export function createRef() {
	return { current: null };
}

export function Fragment(props) {
	return props.children;
}

/**
 * Check if a the argument is a valid Preact VNode.
 * @param {*} vnode
 * @returns {vnode is import('./internal').VNode}
 */
export const isValidElement = vnode =>
	vnode != null && vnode.constructor === undefined;

export function createBackingNode(vnode) {
	const backingNode = {
		key: vnode.props ? vnode.props.key : undefined,
		ref: vnode.props ? vnode.props.ref : undefined,
		type: vnode.type,
		_node: vnode,
		_children: null,
		_parent: null,
		_depth: 0,
		_dom: null,
		// _nextDom must be initialized to undefined b/c it will eventually
		// be set to dom.nextSibling which can return `null` and it is important
		// to be able to distinguish between an uninitialized _nextDom and
		// a _nextDom that has been set to `null`
		_nextDom: undefined,
		_component: null
	};

	if (vnode.props && vnode.props.ref) {
		delete vnode.props.ref;
	}

	if (vnode.props && vnode.props.key) {
		delete vnode.props.key;
	}

	return backingNode;
}
