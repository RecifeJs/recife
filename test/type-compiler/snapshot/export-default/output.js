'use-strict';

module.exports = {
  types: [
    {
      fields: [
        {
          name: 'name',
          isRequired: false,
          type: 'String'
        },
        {
          name: 'exist',
          isRequired: false,
          type: 'Boolean'
        },
        {
          name: 'emails',
          isRequired: true,
          type: '[String]'
        }
      ],
      options: {},
      name: 'User',
      nameModel: 'User',
      isExportDefaultModel: true
    }
  ]
};
