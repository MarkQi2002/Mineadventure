// Node class
class Node {
    // Node Class Constructor
    constructor(data)
    {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}

// Binary Search Tree Class
class BinarySearchTree {
    // Binary Search Tree Class Constructore
    constructor() {
        // Root Of a Binary Search Tree
        this.root = null;
    }

    // Helper Method Which Creates A New Node To
    // Be Inserted And Calls insertNode
    insert(data) {
        // Creating A Node And Initialising
        // With Data
        var newNode = new Node(data);

        // Root Is Null Then Node Will
        // Be Added To The Tree And Made Root.
        if (this.root === null)
            this.root = newNode;
        else
            // Find The Correct Position In The
            // Tree And Add The Node
            this.insertNode(this.root, newNode);
    }

    // Method To Insert A Node In A Tree
    // it moves over the tree to find the location
    // to insert a node with a given data
    insertNode(node, newNode) {
        // if the data is less than the node
        // data move left of the tree
        if (newNode.data < node.data) {
            // if left is null insert node here
            if (node.left === null)
                node.left = newNode;
            else
                // if left is not null recur until
                // null is found
                this.insertNode(node.left, newNode);
        // if the data is more than the node
        // data move right of the tree
        } else {
            // if right is null insert node here
            if (node.right === null)
                node.right = newNode;
            else
                // if right is not null recur until
                // null is found
                this.insertNode(node.right,newNode);
        }
    }

    /// removeNode with a given data
    remove(data) {
        // root is re-initialized with
        // root of a modified tree.
        this.root = this.removeNode(this.root, data);
    }

    // Method to remove node with a
    // given data
    // it recur over the tree to find the
    // data and removes it
    removeNode(node, key) {
        // if the root is null then tree is
        // empty
        if (node === null)
            return null;

        // if data to be delete is less than
        // roots data then move to left subtree
        else if(key < node.data) {
            node.left = this.removeNode(node.left, key);
            return node;
        }

        // if data to be delete is greater than
        // roots data then move to right subtree
        else if(key > node.data) {
            node.right = this.removeNode(node.right, key);
            return node;
        }

        // if data is similar to the root's data
        // then delete this node
        else {
            // deleting node with no children
            if (node.left === null && node.right === null) {
                node = null;
                return node;
            }

            // deleting node with one children
            if (node.left === null) {
                node = node.right;
                return node;
            } else if (node.right === null) {
                node = node.left;
                return node;
            }

            // Deleting node with two children
            // minimum node of the right subtree
            // is stored in aux
            var aux = this.findMinNode(node.right);
            node.data = aux.data;

            node.right = this.removeNode(node.right, aux.data);
            return node;
        }
    }

    // Return InOrder List
    getInorderList() {
        var newList = [];
        this.inorder(this.root, newList);
        return newList;
    }

    // InOrder Helper Function
    inorder(node, newList) {
        if (node !== null) {
            this.inorder(node.left, newList);
            newList.push(node.data);
            this.inorder(node.right, newList);
        }
    }

    // finds the minimum node in tree
    // searching starts from given node
    findMinNode(node) {
        // if left of a node is null
        // then it must be minimum node
        if (node.left === null)
            return node;
        else
            return this.findMinNode(node.left);
    }

    // search for a node with given data
    search(node, data) {
    // if trees is empty return null
        if (node === null)
            return null;

        // if data is less than node's data
        // move left
        else if (data < node.data)
            return this.search(node.left, data);

        // if data is less than node's data
        // move left
        else if (data > node.data)
            return this.search(node.right, data);

        // if data is equal to the node data
        // return node
        else
            return node;
    }
}

// Export Module
module.exports = { BinarySearchTree };