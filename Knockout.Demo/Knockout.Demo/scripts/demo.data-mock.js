var demoData = {
    GridOptions: {
        SearchQuery: '',
        Column: 'Title',
        Direction: directions.ascending
    },
    Folders: [
        {
            Id: 1,
            Title: 'Folder 1',
            ParentId: ''
        },
        {
            Id: 2,
            Title: 'Folder 2',
            ParentId: ''
        },
        {
            Id: 3,
            Title: 'Folder 3 (Child of 1)',
            ParentId: 1
        },
        {
            Id: 4,
            Title: 'Folder 4 (Child of 1)',
            ParentId: 1
        },
        {
            Id: 5,
            Title: 'Folder 5 (Child of 2)',
            ParentId: 2
        }
    ],
    Files: [
        {
            Id: 3,
            Title: 'File1.pdf',
            FolderId: ''
        },
        {
            Id: 4,
            Title: 'File2.doc',
            FolderId: 1
        },
        {
            Id: 5,
            Title: 'File3.xls',
            FolderId: 2
        },
        {
            Id: 7,
            Title: 'File4.mp3',
            FolderId: ''
        },
        {
            Id: 8,
            Title: 'File5.rar',
            FolderId: ''
        },
        {
            Id: 9,
            Title: 'File6.unknown',
            FolderId: ''
        }
    ]
};