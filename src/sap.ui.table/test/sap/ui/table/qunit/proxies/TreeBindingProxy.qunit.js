/*global QUnit,sinon */

sap.ui.define([
	"sap/ui/table/TreeTable"
], function(
	TreeTable
) {
	"use strict";

	QUnit.module("Behaviour for undefined bindings", {
		beforeEach: function() {
			this.oTable = new TreeTable();
			this.oProxy = this.oTable._oProxy;

			// Stub oTable.getBinding
			this.fnGetBinding = sinon.stub(this.oTable, "getBinding");
			this.fnGetBinding.returns({
				getMetadata: function() {
					return {
						getName: function () {
							return undefined;
						}
					};
				}
			});
		},
		afterEach: function() {
			this.fnGetBinding.restore();
			this.oTable.destroy();
		}
	});

	// expand, collapse, toggleExpandedState collapseAll, expandToLevel, setRootLevel, setCollapseRecursive
	// does not make sense to test with no binding

	QUnit.test("#isLeaf", function(assert) {
		assert.ok(this.oProxy.isLeaf(0), "isLeaf returns true");
	});

	QUnit.test("#getNodeByIndex", function(assert) {
		assert.equal(this.oProxy.getNodeByIndex(0), undefined, "getNodeByIndex returns undefined");
	});

	QUnit.test("#getContextByIndex", function(assert) {
		assert.equal(this.oProxy.getContextByIndex(0), undefined, "getContextByIndex returns undefined");
	});

	QUnit.test("#isExpanded", function(assert) {
		assert.notOk(this.oProxy.isExpanded(0), "isExpanded returns false");
	});

	QUnit.test("#getContexts", function(assert) {
		assert.equal(this.oProxy.getContexts(0), 0, "getContexts returns []");
	});

	QUnit.test("#getLevel", function(assert) {
		assert.equal(this.oProxy.getLevel(0), undefined, "getLevel returns undefined");
	});

	QUnit.test("#getSiblingCount", function(assert) {
		assert.equal(this.oProxy.getSiblingCount(0), 0, "getSiblingCount returns 0");
	});

	QUnit.test("#getPositionInParent", function(assert) {
		assert.equal(this.oProxy.getPositionInParent(0), -1, "getPositionInParent returns -1");
	});

	QUnit.test("#isSelectionSupported", function(assert) {
		assert.notOk(this.oProxy.isSelectionSupported(), "isSelectionSupported returns false");
	});

	QUnit.test("#applyLegacySettingsToBindingInfo", function(assert) {
		var oBindingInfo = {};
		var mLegacySettings = {
			rootLevel: 0,
			collapseRecursive: false,
			numberOfExpandedLevels: 0
		};

		this.oProxy.applyLegacySettingsToBindingInfo(oBindingInfo, mLegacySettings);

		assert.equal(oBindingInfo.parameters.rootLevel, mLegacySettings.rootLevel);
		assert.equal(oBindingInfo.parameters.collapseRecursive, mLegacySettings.collapseRecursive);
		assert.equal(oBindingInfo.parameters.numberOfExpandedLevels, mLegacySettings.numberOfExpandedLevels);
	});

	QUnit.module("Behaviour for V4 bindings", {
		beforeEach: function() {
			this.oTable = new TreeTable();
			this.oProxy = this.oTable._oProxy;

			// Enable V4 branch
			this.oProxy._bEnableV4 = true;

			// Stub oTable.getBinding
			this.fnGetBinding = sinon.stub(this.oTable, "getBinding");
			this.fnGetBinding.returns({
				getMetadata: function() {
					return {
						getName: function() {
							return "sap.ui.model.odata.v4.ODataListBinding";
						}
					};
				},
				getContexts: function(iStartIndex, iLength, iThreshold, bKeepCurrent) {
					var aContexts = [];
					for (var i = 0; i < iLength; i++) {
						aContexts.push({
							context: "test" + i
						});
					}
					return aContexts;
				}
			});
		},
		afterEach: function() {
			this.fnGetBinding.restore();
			this.oTable.destroy();
		}
	});

	QUnit.test("#isLeaf", function(assert) {
		var fnGetContextByIndexStub = sinon.stub(this.oProxy, "getContextByIndex");
		fnGetContextByIndexStub.returns({
			getProperty: function(sProperty) {
				return true;
			}
		});

		assert.notOk(this.oProxy.isLeaf(0), "isLeaf returns false");

		fnGetContextByIndexStub.restore();
	});

	QUnit.test("#getNodeByIndex", function(assert) {
		var fnGetContextByIndexStub = sinon.stub(this.oProxy, "getContextByIndex");
		var oContext = { context: "test" };
		fnGetContextByIndexStub.returns(oContext);

		assert.equal(this.oProxy.getNodeByIndex(0), oContext, "getNodeByIndex returns context object");

		fnGetContextByIndexStub.restore();
	});

	QUnit.test("#getContextByIndex", function(assert) {
		assert.deepEqual(this.oProxy.getContextByIndex(0), {context: "test0"}, "getContextByIndex returns context object");
	});

	QUnit.test("#isExpanded", function(assert) {
		var fnGetContextByIndexStub = sinon.stub(this.oProxy, "getContextByIndex");
		fnGetContextByIndexStub.returns({
			getProperty: function(sProperty) {
				return true;
			}
		});

		assert.ok(this.oProxy.isExpanded(0), "isExpanded returns true");

		fnGetContextByIndexStub.restore();
	});

	QUnit.test("#getContexts", function(assert) {
		var fnGetLevelStub = sinon.stub(this.oProxy, "getLevel");
		var fnIsLeafStub = sinon.stub(this.oProxy, "isLeaf");
		var fnIsExpandedStub = sinon.stub(this.oProxy, "isExpanded");

		fnGetLevelStub.returns(0);
		fnIsLeafStub.returns(true);
		fnIsExpandedStub.returns(true);

		var aContexts = this.oProxy.getContexts(0, 3);

		assert.equal(aContexts.length, 3, "getContexts returns array with 3 objects");
		aContexts.forEach(function(oContext, iIndex) {
			assert.equal(oContext.context, "test" + iIndex, "context property is set correctly");
			assert.ok(oContext["_mProxyInfo"], "proxyInfo object exists");
			assert.equal(oContext["_mProxyInfo"].level, 0, "level is 0");
			assert.ok(oContext["_mProxyInfo"].isLeaf, "isLeaf is true");
			assert.ok(oContext["_mProxyInfo"].isExpanded, "isExpanded is true");
		});

		fnGetLevelStub.restore();
		fnIsLeafStub.restore();
		fnIsExpandedStub.restore();
	});

	QUnit.test("#expand", function(assert) {
		var iCounter = 0;

		var fnGetContextByIndexStub = sinon.stub(this.oProxy, "getContextByIndex");
		fnGetContextByIndexStub.returns({
			expand: function(iIndex) {
				iCounter++;
			}
		});

		this.oProxy.expand([0, 4, 6, 2, 1]);
		assert.equal(iCounter, 5, "Context bindings' expand method called 5 times");

		fnGetContextByIndexStub.restore();
	});

	QUnit.test("#collapse", function(assert) {
		var iCounter = 0;

		var fnGetContextByIndexStub = sinon.stub(this.oProxy, "getContextByIndex");
		fnGetContextByIndexStub.returns({
			collapse: function(iIndex) {
				iCounter++;
			}
		});

		this.oProxy.collapse([0, 4, 6, 2, 1]);
		assert.equal(iCounter, 5, "Context bindings' collapse method called 5 times");

		fnGetContextByIndexStub.restore();
	});

	QUnit.test("#collapseAll", function(assert) {
		var fnThrows = function() {
			this.oProxy.collapseAll();
		};
		assert.throws(fnThrows, /Collapsing all nodes is not supported with your current binding./, "Collapse all is not supported in V4");
	});

	QUnit.test("#expandToLevel", function(assert) {
		var fnThrows = function() {
			this.oProxy.expandToLevel(2);
		};
		assert.throws(fnThrows, /Expanding all nodes to a certain level is not supported with your current binding./, "Expanding to level is not supported in V4");
	});

	QUnit.test("#setRootLevel", function(assert) {
		var fnThrows = function() {
			this.oProxy.setRootLevel(0);
		};
		assert.throws(fnThrows, /Setting the root level is not supported with your current binding./, "Setting root level is not supported in V4");
	});

	QUnit.test("#setCollapseRecursive", function(assert) {
		var fnThrows = function() {
			this.oProxy.setCollapseRecursive(false);
		};
		assert.throws(fnThrows, /Setting 'collapseRecursive' is not supported with your current binding./, "Setting collapseRecursive is not supported in V4");
	});

	QUnit.test("#getLevel", function(assert) {
		var fnGetContextByIndexStub = sinon.stub(this.oProxy, "getContextByIndex");
		fnGetContextByIndexStub.returns({
			getProperty: function(sProperty) {
				return 0;
			}
		});

		assert.equal(this.oProxy.getLevel(0), 0, "getLevel returns 0");

		fnGetContextByIndexStub.restore();
	});

	QUnit.test("#getSiblingCount", function(assert) {
		var fnThrows = function() {
			this.oProxy.getSiblingCount(0);
		};
		assert.throws(fnThrows, /The number of siblings of a node cannot be determined with your current binding./, "getSiblingCount throws error");
	});

	QUnit.test("#getPositionInParent", function(assert) {
		var fnThrows = function() {
			this.oProxy.getPositionInParent(0);
		};
		assert.throws(fnThrows, /The position of a node in its parent cannot be determined with your current binding./, "getPositionInParent returns -1");
	});

	QUnit.test("#isSelectionSupported", function(assert) {
		assert.notOk(this.oProxy.isSelectionSupported(), "isSelectionSupported returns false");
	});

	QUnit.module("Behaviour for older bindings", {
		beforeEach: function() {
			this.oTable = new TreeTable();
			this.oProxy = this.oTable._oProxy;

			// Stub oTable.getBinding
			this.fnGetBinding = sinon.stub(this.oTable, "getBinding");
			this.fnGetBinding.returns({
				getMetadata: function() {
					return {
						getName: function() {
							return "sap.ui.model.odata.v2.ODataBinding";
						}
					};
				},
				getNodes: function(iStartIndex, iLength, iThreshold, bKeepCurrent) {
					var aNodes = [];
					for (var i = 0; i < iLength; i++) {
						aNodes.push({
							context: {node: "test" + i},
							nodeState: "nodeState" + i
						});
					}
					return aNodes;
				},
				nodeHasChildren: function() {
					return true;
				},
				getNodeByIndex: function() {
					return {
						node: "test",
						level: 0,
						parent: {children: [1, 2]},
						positionInParent: 3
					};
				},
				getContextByIndex: function() {
					return {context: "test"};
				},
				isExpanded: function() {
					return true;
				}
			});
		},
		afterEach: function() {
			this.fnGetBinding.restore();
			this.oTable.destroy();
		}
	});

	QUnit.test("#isLeaf", function(assert) {
		var fnGetNodeByIndexStub = sinon.stub(this.oProxy, "getNodeByIndex");
		fnGetNodeByIndexStub.returns({});

		assert.notOk(this.oProxy.isLeaf(0), "isLeaf returns false");

		fnGetNodeByIndexStub.restore();
	});

	QUnit.test("#getNodeByIndex", function(assert) {
		assert.deepEqual(this.oProxy.getNodeByIndex(0), {
			node: "test",
			level: 0,
			parent: {children: [1, 2]},
			positionInParent: 3
		}, "getNodeByIndex returns context object");
	});

	QUnit.test("#getContextByIndex", function(assert) {
		assert.deepEqual(this.oProxy.getContextByIndex(0), {context: "test"}, "getContextByIndex returns context object");
	});

	QUnit.test("#isExpanded", function(assert) {
		assert.ok(this.oProxy.isExpanded(0), "isExpanded returns true");
	});

	QUnit.test("#getContexts", function(assert) {
		var fnGetLevelStub = sinon.stub(this.oProxy, "getLevel");
		var fnIsLeafStub = sinon.stub(this.oProxy, "isLeaf");
		var fnIsExpandedStub = sinon.stub(this.oProxy, "isExpanded");

		fnGetLevelStub.returns(0);
		fnIsLeafStub.returns(true);
		fnIsExpandedStub.returns(true);

		var aContexts = this.oProxy.getContexts(0, 3);

		assert.equal(aContexts.length, 3, "getContexts returns array with 3 objects");
		aContexts.forEach(function(oContext, iIndex) {
			assert.equal(oContext.node, "test" + iIndex, "context property is set correctly");
			assert.ok(oContext["_mProxyInfo"], "proxyInfo object exists");
			assert.equal(oContext["_mProxyInfo"].level, 1, "level is 1");
			assert.ok(oContext["_mProxyInfo"].isLeaf, "isLeaf is true");
			assert.ok(oContext["_mProxyInfo"].isExpanded, "isExpanded is true");
			assert.ok(oContext["_mProxyInfo"].nodeState, "nodeState" + iIndex, "node state is set correctly");
		});

		fnGetLevelStub.restore();
		fnIsLeafStub.restore();
		fnIsExpandedStub.restore();
	});

	QUnit.test("#expand", function(assert) {
		var aIndices = [];
		this.fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return "sap.ui.model.odata.v2.ODataBinding";
					}
				};
			},
			expand: function(iIndex) {
				aIndices.push(iIndex);
			},
			isExpanded: function() {
				return false;
			}
		});
		var fnIsLeafStub = sinon.stub(this.oProxy, "isLeaf");
		fnIsLeafStub.returns(false);

		this.oProxy.expand([0, 4, 6, 2, 1]);
		assert.equal(aIndices.length, 5, "Context bindings' expand method called 5 times");
		assert.deepEqual(aIndices, [6, 4, 2, 1, 0], "Context bindings' expand order correct");

		fnIsLeafStub.restore();
	});

	QUnit.test("#collapse", function(assert) {
		var aIndices = [];
		this.fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return "sap.ui.model.odata.v2.ODataBinding";
					}
				};
			},
			collapse: function(iIndex) {
				aIndices.push(iIndex);
			},
			isExpanded: function() {
				return true;
			}
		});
		var fnIsLeafStub = sinon.stub(this.oProxy, "isLeaf");
		fnIsLeafStub.returns(false);

		this.oProxy.collapse([0, 4, 6, 2, 1]);
		assert.equal(aIndices.length, 5, "Context bindings' expand method called 5 times");
		assert.deepEqual(aIndices, [6, 4, 2, 1, 0], "Context bindings' expand order correct");

		fnIsLeafStub.restore();
	});

	QUnit.test("#collapseAll", function(assert) {
		var bCalled = false;
		this.fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return "sap.ui.model.odata.v2.ODataBinding";
					}
				};
			},
			collapseToLevel: function(iIndex) {
				bCalled = true;
			}
		});

		this.oProxy.collapseAll();
		assert.ok(bCalled, "Binding's collapseToLevel was called");
	});

	QUnit.test("#expandToLevel", function(assert) {
		var bCalled = false;
		this.fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return "sap.ui.model.odata.v2.ODataBinding";
					}
				};
			},
			expandToLevel: function(iIndex) {
				bCalled = true;
			}
		});

		this.oProxy.expandToLevel(4);
		assert.ok(bCalled, "Binding's collapseToLevel was called");
	});

	QUnit.test("#setRootLevel", function(assert) {
		var iRootLevel = -1;
		this.fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return "sap.ui.model.odata.v2.ODataBinding";
					}
				};
			},
			setRootLevel: function(iLevel) {
				iRootLevel = iLevel;
			}
		});
		this.oProxy.setRootLevel(5);
		assert.equal(iRootLevel, 5, "Root level is set to 5");
	});

	QUnit.test("#setCollapseRecursive", function(assert) {
		var bCollapseRecursive = false;
		this.fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return "sap.ui.model.odata.v2.ODataBinding";
					}
				};
			},
			setCollapseRecursive: function(bCollapse) {
				bCollapseRecursive = bCollapse;
			}
		});
		this.oProxy.setCollapseRecursive(true);
		assert.ok(bCollapseRecursive, "collapseRecursive is true");
	});

	QUnit.test("#getLevel", function(assert) {
		assert.equal(this.oProxy.getLevel(0), 0, "getLevel returns 0");
	});

	QUnit.test("#getSiblingCount", function(assert) {
		assert.equal(this.oProxy.getSiblingCount(0), 2, "getSiblingCount returns 2");
	});

	QUnit.test("#getPositionInParent", function(assert) {
		assert.equal(this.oProxy.getPositionInParent(0), 3, "getPositionInParent returns 2");
	});

	QUnit.test("#isSelectionSupported", function(assert) {
		assert.ok(this.oProxy.isSelectionSupported(), "isSelectionSupported returns true");
	});
});