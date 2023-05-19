// JavaScript Have Garbage Collection Properties
// Binary Tree Node Class
class BinarySearchTreeNode {
    // Binary Tree Node Constructor
    // this.data -> Data Stored In BST Node
    // this.left -> Left Pointer To Another BST Node
    // this.right -> Right Pointer To Another BST Node
    constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}

// Binary Search Tree Class
class BinarySearchTree {
    // BinarySearchTree Constructor
    // this.root -> BST Root Which Point To A BST Node
    constructor() {
        // Binary Search Tree Root
        this.root = null;
    }
 
    // Helper Method Which Creates A New Node To Be Inserted And Call insertNode
    insert(data) {
        // Creating A Node Initialzied With Data
        var newNode = new BinarySearchTreeNode(data);
                        
        // Empty BST -> Make newNode Root
        if (this.root === null) {
            this.root = newNode;
        // Non Empty BST -> Insert newNode Into BST
        } else {
            this.insertNode(this.root, newNode);
        }
    }
    
    // Recursive Method To Insert BST Node Into BST
    insertNode(node, newNode) {
        // Data Less Than Current Node
        if (newNode.data < node.data) {
            if (node.left === null) {
                node.left = newNode;
            } else {
                this.insertNode(node.left, newNode);
            }
        // Data Greater Or Equal To Current Nodes
        } else {
            if (node.right === null) {
                node.right = newNode;
            } else {
                this.insertNode(node.right,newNode);
            }
        }
    }

    // Remove Node With Certain Data
    remove(data){
        // removeNode -> Recursive Remove Method
        // this.root -> New BST
        this.root = this.removeNode(this.root, data);
    }
    
    // Recursive Node Deletion Method
    removeNode(node, key){
        // Empty BST
        if(node === null) {
            return null;
        // Data Less Than Current Node
        } else if(key < node.data) {
            node.left = this.removeNode(node.left, key);
            return node;
        // Data Greate Than Current Node
        } else if(key > node.data) {
            node.right = this.removeNode(node.right, key);
            return node;
        // Remove BST Node With Exact Same Data
        } else {
            // BST Node Without Children
            if (node.left === null && node.right === null) {
                node = null;
                return node;
            // BST Node With One Left Child
            } if (node.left === null) {
                node = node.right;
                return node;
            // BST Node With One Right Child
            } else if (node.right === null) {
                node = node.left;
                return node;
            }
            
            // BST Node With Two Children, Move Minimum Node In Right Subtree To Current Node
            var aux = this.findMinNode(node.right);
            node.data = aux.data;
            node.right = this.removeNode(node.right, aux.data);
            return node;
        }
    }

    // Return InOrder List
    getInorderList(){
        var newList = [];
        this.inOrder(this.root, newList);
        return newList;
    }

    // Recursive InOrder Helper Method
    inOrder(node, newList){
        if (node !== null) {
            this.inOrder(node.left, newList);
            newList.push(node.data);
            this.inOrder(node.right, newList);
        }
    }

    // Method To Find Minimum BST Node
    findMinNode(node) {
        if (node.left === null)
            return node;
        else
            return this.findMinNode(node.left);
    }

    // Method To Search A Node With Certain Data
    search(node, data){
        // Empty BST
        if (node === null)
            return null;
        // Data Less Than Current Node Data
        else if(data < node.data)
            return this.search(node.left, data);
        // Data Greater Than Current Node Datas
        else if(data > node.data)
            return this.search(node.right, data);
        // Data Equal To Current Node Data
        else
            return node;
    }
}

// Exports BinarySearchTree
module.exports = {BinarySearchTree};