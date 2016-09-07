var CLINVAR = {
  LABEL: 'Pathogenicity - ClinVar',
  SYMBOL: "/*[local-name()='g']",
  BENIGN: "/*[local-name()='g']",
  PATHOGENIC: "/*[local-name()='g']"
};

var SIFT = {
  LABEL: 'Pathogenecity - SIFT',
  SYMBOL: "/*[local-name()='g']",
  TOLERATED: "/*[local-name()='g']"
};

var POLYPHEN = {
  LABEL: 'Pathogenicity - PolyPhen'
};

var VEP = {
  LABEL: 'Impact - VEP'
};

var BOOKMARK = {
  LABEL: 'Bookmark'
};

var INHERITANCE = {
  LABEL: 'Inheritance Mode'
};

var AF1000G = {
  LABEL: 'Allele Frequency - 1000G'
};

var AFEXAC = {
  LABEL: 'Allele Frequency - ExAC'
};

var ZYGOSITY = {
  LABEL: 'Zygosity'
};

function precedingSiblingsToLabel(label) {
  return [
    "//div[@id='feature-matrix']",
    "/*[local-name()='svg']",
    "/*[local-name()='g' and @class='y axis']",
    "/*[local-name()='g']/*[local-name()='text' and text()='" + label + "']",
    "/..",
    "/preceding-sibling::*"
  ].join("");
}

function precedingSiblingsToVariant(variant) {
  return [
    "//div[@id='feature-matrix']",
    "/*[local-name()='svg']",
    "/*[local-name()='g' and @class='colhdr']",
    "/*[local-name()='g']/*[local-name()='text' and text()='" + variant + "']",
    "/..",
    "/preceding-sibling::*"
  ].join("");
}

module.exports = {
  selector: '#matrix-track',
  commands: [{

    // CLINVAR
    assertClinVarBenign: function(variants) {
      this.assertSymbolsPresent(CLINVAR.LABEL, variants, CLINVAR.BENIGN);
    },
    assertClinVarPathogenic: function(variants) {
      this.assertSymbolsPresent(CLINVAR.LABEL, variants, CLINVAR.PATHOGENIC);
    },
    assertClinVarNull: function(variants) {
      this.assertSymbolsNotPresent(CLINVAR.LABEL, variants, CLINVAR.SYMBOL);
    },

    // SIFT
    assertSIFTTolerated: function(variants) {
      this.assertSymbolsPresent(SIFT.LABEL, variants, SIFT.TOLERATED);
    },
    assertSIFTNull: function(variants) {
      this.assertSymbolsNotPresent(SIFT.LABEL, variants, SIFT.SYMBOL);
    },



    assertSymbolsPresent: function(label, variants, symbolSelector) {
      var self = this;
      this.assertSymbols(label, variants, symbolSelector, function(pathToSymbol) {
        self.api.useXpath();
        self.expect.element(pathToSymbol).to.be.present;
        self.api.useCss();
      });
    },
    assertSymbolsNotPresent: function(label, variants, symbolSelector) {
      var self = this;
      this.assertSymbols(label, variants, symbolSelector, function(pathToSymbol) {
        self.api.useXpath();
        self.expect.element(pathToSymbol).to.not.be.present;
        self.api.useCss();
      });
    },
    assertSymbols: function(label, variants, symbolSelector, expectation) {
      var self = this;
      this.api.elements('xpath', precedingSiblingsToLabel(label), function(precedingLabelElements) {
        var labelIndex = precedingLabelElements.value.length + 1;
        var row = "/*[local-name()='g'][" + labelIndex + "]";

        variants.forEach(function(variant) {
          self.api.elements('xpath', precedingSiblingsToVariant(variant), function(precedingVariantElements) {
            var variantIndex = precedingVariantElements.value.length + 1;
            var column = "/*[local-name()='g'][" + variantIndex + "]";
            var pathToSymbol = "//div[@id='feature-matrix']/*[local-name()='svg']/*[@class='group']" + column + row + symbolSelector;
            expectation(pathToSymbol);
          });
        });
      });
    },
    waitForMatrixLoaded: function() {
      this.waitForElementVisible('@featureMatrix', 45000);
    }
  }],
  elements: {
    featureMatrix: { selector: '#feature-matrix' }
  }
};



