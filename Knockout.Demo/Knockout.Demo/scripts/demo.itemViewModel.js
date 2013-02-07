/**
* Item view model
*/
function ItemViewModel(parent, isFolder, id, title, folderId) {
    var self = this;

    // Observable properties
    self.id = ko.observable();
    self.extension = ko.observable();
    self.isActive = ko.observable(false);

    // Create title with required extension
    self.title = ko.observable().extend({ required: true });

    // Properties, that never changes dinamically, can be created non-observable
    self.parent = parent;
    self.folderId = '';
    self.isFolder = isFolder;

    // Temporary properties for keeping old values, when editing row
    self.oldTitle = null;
    self.oldExtension = null;

    // Subscribe to title value change events
    self.title.subscribe(function () {
        if (!self.isActive()) {
            self.oldTitle = self.title();
        }
    });

    // Subscribe to extension value change events
    self.extension.subscribe(function () {
        if (!self.isActive()) {
            self.oldExtension = self.extension();
        }
    });

    /**
    * Computed KnockOut function, returns class name for row, depending on item type and active status
    */
    self.rowClassNames = ko.computed(function () {
        var classes;
        if (self.isFolder) {
            classes = 'demo-folder-box';
            if (self.isActive()) {
                classes += ' demo-folder-box-active';
            }
        } else {
            classes = 'demo-file-box';
            if (self.isActive()) {
                classes += ' demo-file-box-active';
            }
        }

        return classes;
    });

    /**
    * Computed KnockOut function, returns class name for div, which displays file's or folders icon
    */
    self.iconClassNames = ko.computed(function () {
        var classes;

        if (self.isFolder) {
            classes = 'demo-system-folder';
        } else {
            classes = 'demo-system-file';

            if (self.extension()) {
                classes += getFileExtensionCssClassName(self.extension());
            }
        }

        return classes;
    });

    /** 
    * Saves an item
    */
    self.saveItem = function () {
        if (self.title.hasError()) {
            return;
        }

        // Add item to all items list and set new id
        if (!self.id()) {
            self.parent.allItems.push(self);
            self.id(self.parent.getNewId());
        }

        // Set extension
        setExtension();

        self.isActive(false);

        // Setting old values
        self.oldTitle = self.title();
        self.oldExtension = self.extension();
    };

    /**
    * Deletes an item
    */
    self.deleteItem = function (parentViewModel) {
        // Saves or cancels all edits
        self.parent.saveOrCancelAllEdits();

        // <a data-bind="click: deleteItem.bind($data, $parent)">Delete</a>
        // Using "this" instead of "self" - first bound parameter is item itself
        // and second bound parameter is parent view model
        // This example shows, how binding with parameters works
        var deletingItem = this;

        if (confirm("Are you sure you want to delete this item?")) {
            parentViewModel.items.remove(deletingItem);
            parentViewModel.allItems.remove(deletingItem);
        }
    };

    /**
    * Starts inline editing of an item
    */
    self.editItem = function () {
        // Saves or cancels all edits
        self.parent.saveOrCancelAllEdits();

        self.isActive(true);
    };

    /*
    * Opens item, depending on it's type
    */
    self.openItem = function () {
        if (self.isFolder) {
            self.parent.changeFolder(self.id());
        } else {
            self.editItem();
        }
    };

    /**
    * Cancels inline editing of an item
    */
    self.cancelEditItem = function () {
        if (!self.id()) {
            // If item was new, remove it from grid
            self.parent.items.remove(self);
        } else {
            // Restore old values
            self.title(self.oldTitle);
            self.extension(self.oldExtension);

            self.isActive(false);
        }
    };

    /**
    * Saves an item or cancels edit mode, depending on title.hasError()
    */
    self.saveOrCancelEdit = function() {
        if (self.isActive()) {
            if (self.title.hasError()) {
                self.cancelEditItem();
            } else {
                self.saveItem();
            }
        }
    };

    // Set properties with chain syntax
    self.id(id).title(title);
    setExtension();
    self.folderId = folderId;

    /**
    * Private function, returns CSS class, depending on file extension
    */
    function getFileExtensionCssClassName(extension) {
        if (extension.indexOf('.') === 0) {
            extension = extension.substring(1, extension.length);
        }
        switch (extension.toLowerCase()) {
            case "pdf":
                return ' demo-pdf-icn';
            case "doc":
                return ' demo-word-icn';
            case "xls":
                return ' demo-xls-icn';
            case "mp3":
                return ' demo-mp3-icn';
            case "mp4":
                return ' demo-mp4-icn';
            case "ppt":
            case "pptx":
                return ' demo-ppt-icn';
            case "rar":
                return ' demo-rar-icn';
            case "wav":
                return ' demo-wav-icn';
            default:
                return ' demo-uknown-icn';
        }
    }

    /**
    * Private function, sets file extension
    */
    function setExtension() {
        if (!self.isFolder) {
            var title = self.title(),
                split = title ? title.split('.') : [];
            if (split.length > 1) {
                self.extension(split[split.length - 1]);
            } else {
                self.extension('');
            }
        }
    }
}