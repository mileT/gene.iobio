var appTitleSection = require('./sections/appTitleSection.js');
var dataCard = require('./sections/dataCard.js');
var sliderIconBar = require('./sections/sliderIconBar.js');
var sliderLeft = require('./sections/sliderLeft.js');

module.exports = {
  url: function() {
    return this.api.launchUrl;
  },

  elements: {
    sliderLeft: '#slider-left',
    appTitleSection: '#app-title-section',
    dataCard: '#data-card',
    matrixTrack: '#matrix-track',
    transcriptCard: '#transcript-card',
    probandVariantCard: '#proband-variant-card',
    motherVariantCard: '#other-variant-cards .variant-card:nth-child(1)',
    fatherVariantCard: '#other-variant-cards .variant-card:nth-child(2)'
  },

  commands: [{
    load: function() {
      return this.navigate().waitForElementVisible('@sliderLeft');
    }
  }],

  sections: {
    appTitleSection: appTitleSection,
    dataCard: dataCard,
    sliderIconBar: sliderIconBar,
    sliderLeft: sliderLeft,

    matrixTrack: {
      selector: '#matrix-track',
      elements: {
        featureMatrix: { selector: '#feature-matrix' }
      }
    },

    transcriptCard: {
      selector: '#transcript-card',
      elements: {
        geneName: { selector: '#gene-name' }
      }
    },

    probandVariantCard: {
      selector: '#proband-variant-card',
      elements: {

      }
    },

    motherVariantCard: {
      selector: '#other-variant-cards .variant-card:nth-child(1)'
    },

    fatherVariantCard: {
      selector: '#other-variant-cards .variant-card:nth-child(2)'
    }

  }
};