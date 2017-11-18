    /**
     * @ngdoc function
     * @name LinkedList
     * @description
     *
     * TBD: LinkedList implementation
     *
     *
     */

function LinkedList() 
{
    // The number of items in the list
    this._length = 0;
    
    // Pointer to first item in the list
    this._head   = null;

    // Pointer to last item in the list 
    this._tail   = null;
}

LinkedList.prototype = {

    // Constructor
    constructor: LinkedList,
    
    // Appends some data to the end of the list. This method traverses
    // the existing list and places the value at the end in a new item
    add: function (data)
    {
        // Create a new item object, place data in
        var node =  { 
                        data: data, 
                        next: null,
                        prev: null
                    };
    
        // No items in the list yet
        if (this._length == 0) 
        {
            this._head = node;
            this._tail = node;
        }
        else
        {
            // Attach to the tail node
            this._tail.next = node;
            node.prev       = this._tail;
            this._tail      = node;
        }        
        
        // Update the count
        this._length++;
    },
    
    // Retrieves the data by index
    itemByIndex: function (index)
    {
        // Check for out-of-bounds values
        if (index > -1 && index < this._length)
        {
            var current = this._head,
                i = 0;
                
            while(i++ < index)
            {
                current = current.next;            
            }
        
            return current.data;
        }
        else
        {
            return null;
        }
    },

    // Retrieves the data by _id
    itemById: function (id)
    {
        var result  = null;
        var current = this._head;
        
        while(current)
        {
            if ( id === current.data.getId() )
            {
                result = current.data;
                break;
            }
        }

        return result;
    },
    
    // Removes the item by index
    remove: function (index)
    {
        // Check for out-of-bounds values
        if (index > -1 && index < this._length)
        {    
            var current = this._head,
                i = 0;
                
            // Removing first item
            if (index === 0)
            {
                this._head = current.next;

                if (!this._head)
                {
                    this._tail = null;
                }
                else
                {
                    this._head.prev = null;
                }
            } 
            else if (index === this._length -1) // Removing last item
            {
                current = this._tail;
                this._tail = current.prev;
                this._tail.next = null;
            }
            else
            {
                // Find the right location
                while(i++ < index)
                {
                    current = current.next;            
                }
            
                // Skip over the item to remove
                current.prev.next = current.next;
            }
        
            // Decrement the length
            this._length--;
        
            // Return the value
            return current.data;            
        }
        else
        {
            return null;
        }
    },
    
    // Returns the number of items in the list
    size: function()
    {
        return this._length;
    },
    
    // Converts the list into an array
    toArray: function()
    {
        var result  = [];
        var current = this._head;
        
        while(current)
        {
            result.push(current.data);
            current = current.next;
        }
        
        return result;
    },

    // Converts the list into an Json
    toJson: function()
    {
        var result  = {};
        
        // WIP
        
        return result;
    },
    
    // Converts the list into a string representation
    toString: function()
    {
        return this.toArray().toString();
    }
};
