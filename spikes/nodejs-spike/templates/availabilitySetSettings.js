
var fs = require('fs');
var _ = require('../lodashMixins.js');
let v = require('./validation.js');

const defaultsPath = './nodejs-spike/defaults/availabilitySetSettings.json';

function mergeAndValidate(settings, baseObjectSettings) {
  let defaults = JSON.parse(fs.readFileSync(defaultsPath, 'UTF-8'));

  return v.mergeAndValidate(settings, defaults, availabilitySetValidations, baseObjectSettings)
}

let availabilitySetValidations = {
  useExistingAvailabilitySet: (result, parentKey, key, value, parent, baseObjectSettings) => {
    if (_.isNullOrWhitespace(value) || (_.toLower(value) !== 'yes' && _.toLower(value) !== 'no')) {
      result.push({
        name: _.join((parentKey ? [parentKey, key] : [key]), '.'),
        message: "Invalid value provided for 'useExistingAvailabilitySet'. Valid values are: 'yes', 'no'."
      })
    }
  },
  platformFaultDomainCount: v.validationUtilities.isNumber,
  platformUpdateDomainCount: v.validationUtilities.isNumber,
  name: v.validationUtilities.isNullOrWhitespace,
};

function buildAvSetParameters(settings, parent) {
  if (_.toLower(settings.useExistingAvailabilitySet) === "yes") {
    return [];
  }
  // Use resourceGroup and subscription from parent if not not specified 
  let instance = {
    "resourceGroup": settings.resourceGroup || parent.resourceGroup,
    "subscription": settings.subscription || parent.subscription,
    "name": settings.name,
    "properties": {
      "platformFaultDomainCount": settings.platformFaultDomainCount,
      "platformUpdateDomainCount": settings.platformUpdateDomainCount
    }
  };

  return _.castArray(instance)
}

exports.processAvSetSettings = buildAvSetParameters;
exports.mergeAndValidate = mergeAndValidate;
