// Enumerators
var directions = {
    ascending: 1,
    descending: 2
},
    defaultDirection = directions.ascending,
    defaultSortColumn = 'Title';

/**
* Items list view model
*/
function ListViewModel() {
    var self = this;

    // Create observable array for items
    self.allItems = ko.observableArray();
    self.items = ko.observableArray();
    self.path = ko.observableArray();

    // Search and sort parameters
    self.searchQuery = ko.observable(''); // Empty search query by default
    self.sortColumn = ko.observable(defaultSortColumn); // By default, sorting by title
    self.sortDirection = ko.observable(defaultDirection); // By default, sorting in ascending direction

    // Selected folder
    self.folderId = ko.observable(''); // Root folder by default

    /**
    * Adds new folder to the list
    */
    self.addNewFolder = function () {
        addNewItem(true);
    };

    /**
    * Adds new file
    */
    self.addNewFile = function () {
        addNewItem(false);
    };

    /**
    * Searches a folder for given search query
    */
    self.searchItems = function () {
        // Saves or cancels all edits
        self.saveOrCancelAllEdits();

        setItems();
    };

    /**
    * Sorts folder by given column
    */
    self.sortItems = function (column) {
        // Saves or cancels all edits
        self.saveOrCancelAllEdits();

        var columnBefore = self.sortColumn(),
            wasDescending = self.sortDirection() == directions.descending;
        if (columnBefore == column) {
            self.sortDirection(wasDescending ? directions.ascending : directions.descending);
        } else {
            self.sortDirection(directions.ascending);
        }
        self.sortColumn(column);

        setItems();
    };

    /**
    * Selects folder, by given id
    */
    self.changeFolder = function (id) {
        // Saves or cancels all edits
        self.saveOrCancelAllEdits();

        self.folderId(id);

        // Add folder to path
        var i, folder;
        for (i = 0; i < self.allItems().length; i++) {
            if (self.allItems()[i].id() == id) {
                folder = self.allItems()[i];
                break;
            }
        }
        setPathFolder(folder || self.path()[0]);

        // Clear sort and search query
        self.sortDirection(defaultDirection);
        self.sortColumn(defaultSortColumn);
        self.searchQuery('');

        setItems();
    };

    /**
    * Opens folder's parent folder
    */
    self.openParentFolder = function () {
        // Saves or cancels all edits
        self.saveOrCancelAllEdits();

        var parentId = '',
            currentId = self.folderId();

        for (var l = 0; l < self.allItems().length; l++) {
            if (self.allItems()[l].id() == currentId) {
                parentId = self.allItems()[l].folderId;
                break;
            }
        }

        self.changeFolder(parentId);
    };

    /** 
    * Helper method. Return true if data is sorted by specified column ascending.
    */
    self.isSortedAscending = function (column) {
        return column == self.sortColumn() && self.sortDirection() == directions.ascending;
    };

    /**
    * Helper method Return true if data is sorted by specified column descending.
    */
    self.isSortedDescending = function (column) {
        return column == self.sortColumn() && self.sortDirection() == directions.descending;
    };

    /**
    * Computed KnockOut function, returns true, if current folder is root folder
    */
    self.isRootFolder = ko.computed(function () {
        return !self.folderId();
    });

    /**
    * Gets next items id
    */
    self.getNewId = function() {
        var id = 0;

        for (var m = 0; m < self.allItems().length; m++) {
            if (self.allItems()[m].id() > id) {
                id = self.allItems()[m].id();
            }
        }

        return id + 1;
    };

    /**
    * Saves or cancels all current edits
    */
    self.saveOrCancelAllEdits = function() {
        // Stop editing, if some item is in edit mode
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i];
            if (item.isActive()) {
                item.saveOrCancelEdit();
            }
        }
    };

    /**
    * Private method, adds new item to grid
    */
    function addNewItem(isFolder) {
        // Saves or cancels all edits
        self.saveOrCancelAllEdits();

        var newItem = new ItemViewModel(self, isFolder);
        newItem.folderId = self.folderId();

        // Set item as active (editable)
        newItem.isActive(true);

        // Add new item to the top of showing items
        self.items.unshift(newItem);
    }

    /**
    * Private method, adds folder to path, or removes folders from path
    */
    function setPathFolder(folder) {
        var i,
            remove;

        // If root folder, remove all from the root
        if (!folder.id()) {
            remove = 1;
        } else {
            // Get folders to pop out from the path
            for (i = 0; i < self.path().length; i++) {
                if (self.path()[i].id() == folder.id()) {
                    remove = i + 1;
                    break;
                }
            }
        }

        // If folder already exists in the list, remove all childs from path
        if (remove) {
            for (i = remove; i < self.path().length; i++) {
                self.path.pop();
            }
        } else {
            // Add folder to path 
            self.path.push(folder);
        }
    };

    /**
    * Private method, fills items observable array with items, filtered by folder,
    * search query, and sorted by given parameters
    */
    function setItems() {
        var query = (self.searchQuery() || '').toLowerCase(),
            currentFolderId = self.folderId() || '';

        self.items.removeAll();

        for (var i = 0; i < self.allItems().length; i++) {
            var item = self.allItems()[i],
                folderId = item.folderId || '';

            // Filter items out by folder id
            if (currentFolderId != folderId) {
                continue;
            }

            // Filter items out by search query
            if (query && item.title().toLowerCase().indexOf(query) < 0) {
                continue;
            }

            self.items.push(item);
        }

        // Sort items
        if (self.items().length > 0) {
            self.items.sort(sortItemsList);
        }
    }

    /**
    * Private method, sorts an items array
    */
    function sortItemsList(left, right) {
        var column = self.sortColumn(),
            isAscending = self.sortDirection() == directions.ascending,
            leftValue = column == 'Title' || left.isFolder ? left.title().toLowerCase() : left.extension().toLowerCase(),
            rightValue = column == 'Title' || right.isFolder ? right.title().toLowerCase() : right.extension().toLowerCase();

        // Folder always wins in ascending mode
        if (left.isFolder != right.isFolder) {
            if (left.isFolder) {
                return isAscending ? -1 : 1;
            } else {
                return isAscending ? 1 : -1;
            }
        }

        // Sort by name, depenging on sort direction
        return leftValue == rightValue
            ? 0
            : (leftValue < rightValue
                ? (isAscending ? -1 : 1)
                : (isAscending ? 1 : -1));
    }

    /**
    * Funtion initializes list view models
    */
    self.initialize = function() {
        // Clear path
        self.path.removeAll();

        // Add root folder to path
        var rootFolder = new ItemViewModel(self, true);
        rootFolder.title('..');
        self.path.push(rootFolder);

        // Set current folder to root
        self.folderId('');

        // Fill observable items array with current folder items
        setItems();
    };
}

