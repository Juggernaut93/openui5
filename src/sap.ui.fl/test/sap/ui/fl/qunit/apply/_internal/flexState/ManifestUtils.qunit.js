/* global QUnit */

sap.ui.define([
	"sap/ui/core/Manifest",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Manifest,
	ManifestUtils,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var sReference = "fl.reference";

	function createAppComponent(bFlexExtensionPointEnabled) {
		return {
			getManifestEntry: function () {
				return {
					flexExtensionPointEnabled: bFlexExtensionPointEnabled
				};
			},
			getComponentData: function () {},
			getManifestObject: function () {
				return {
					getEntry: function () {
						return {
							appVariantId: "appId"
						};
					}
				};
			}
		};
	}

	QUnit.module("ManifestUtils.getFlexReferenceForControl", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("with a control", function (assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(createAppComponent(false));
			assert.equal(ManifestUtils.getFlexReferenceForControl({}), "appId", "the app id is returned");
		});
	});

	QUnit.module("ManifestUtils.getFlexReference", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("with 'sap-app-id'", function (assert) {
			var mPropertyBag = {
				componentData: {
					startupParameters: {
						"sap-app-id": ["oldAppId"]
					}
				}
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "oldAppId", "the old app var id is returned");
		});

		QUnit.test("with an appvar id (raw manifest)", function (assert) {
			var mPropertyBag = {
				manifest: {
					"sap.ui5": {
						appVariantId: "appVarId"
					}
				}
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "appVarId", "the new app var id is returned");
		});

		QUnit.test("with sap.ui5 component name (raw manifest)", function (assert) {
			var mPropertyBag = {
				manifest: {
					"sap.ui5": {
						componentName: "componentName"
					}
				}
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "componentName.Component", "the componentName is returned");
		});

		QUnit.test("without old or new appvar id or componentName (raw manifest)", function (assert) {
			var oGetAppIdStub = sandbox.stub(Utils, "getAppIdFromManifest").returns("appId");
			var mPropertyBag = {
				manifest: {
					"sap-ui6": {
						appVariantId: "appVarId"
					}
				}
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "appId.Component", "the app id is returned");
			assert.equal(oGetAppIdStub.callCount, 1, "the function was called");
		});

		QUnit.test("with an appvar id (manifest object)", function (assert) {
			var mPropertyBag = {
				manifest: new Manifest({
					"sap.ui5": {
						appVariantId: "appVarId"
					}
				})
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "appVarId", "the new app var id is returned");
		});

		QUnit.test("with sap.ui5 component name (manifest object)", function (assert) {
			var mPropertyBag = {
				manifest: new Manifest({
					"sap.ui5": {
						componentName: "componentName"
					}
				})
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "componentName.Component", "the componentName is returned");
		});

		QUnit.test("without old or new appvar id or componentName (manifest object)", function (assert) {
			var oGetAppIdStub = sandbox.stub(Utils, "getAppIdFromManifest").returns("appId");
			var mPropertyBag = {
				manifest: new Manifest({
					"sap-ui6": {
						appVariantId: "appVarId"
					}
				})
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "appId.Component", "the app id is returned");
			assert.equal(oGetAppIdStub.callCount, 1, "the function was called");
		});

		QUnit.test("with manifest object at design time and getComponentName is available", function (assert) {
			var mPropertyBag = {
				manifest: {
					getEntry: function () {
						return {
							id: Utils.APP_ID_AT_DESIGN_TIME
						};
					},
					getComponentName: function() {
						return "appId";
					}
				}
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "appId.Component", "the app id is returned");
		});

		QUnit.test("with manifest object at design time and getComponentName is not available", function (assert) {
			var mPropertyBag = {
				manifest: {
					getEntry: function () {
						return {
							id: Utils.APP_ID_AT_DESIGN_TIME
						};
					}
				}
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), Utils.APP_ID_AT_DESIGN_TIME + ".Component", "the app id at design time is returned");
		});

		QUnit.test("with manifest raw at design time and name property available", function (assert) {
			var mPropertyBag = {
				manifest: {
					"sap-ui6": {
						appVariantId: "appVarId"
					},
					"sap.app": {
						id: Utils.APP_ID_AT_DESIGN_TIME
					},
					name: "appId.Component"
				}
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "appId.Component", "the app id is returned");
		});

		QUnit.test("with manifest raw at design time and name property is not available", function (assert) {
			var mPropertyBag = {
				manifest: {
					"sap-ui6": {
						appVariantId: "appVarId"
					},
					"sap.app": {
						id: Utils.APP_ID_AT_DESIGN_TIME
					}
				}
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), Utils.APP_ID_AT_DESIGN_TIME + ".Component", "the app id at design time is returned");
		});
	});

	QUnit.module("ManifestUtils.getCacheKeyFromAsyncHints", {}, function() {
		QUnit.test("without async hints given", function(assert) {
			assert.equal(ManifestUtils.getCacheKeyFromAsyncHints({}), undefined, "nothing is returned");
		});

		QUnit.test("with filled async hints given", function(assert) {
			var oAsyncHints = {
				requests: [
					{
						name: "sap.ui.fl.changes",
						reference: sReference,
						cachebusterToken: "token"
					}
				]
			};
			assert.equal(ManifestUtils.getCacheKeyFromAsyncHints(sReference, oAsyncHints), "token", "the cachebusterToken is returned");
		});

		QUnit.test("with filled async hints given but with a differing reference (legacy app variant)", function(assert) {
			var oAsyncHints = {
				requests: [
					{
						name: "sap.ui.fl.changes",
						reference: "some other reference",
						cachebusterToken: "token"
					}
				]
			};
			assert.equal(ManifestUtils.getCacheKeyFromAsyncHints(sReference, oAsyncHints), undefined, "no cachebusterToken is returned");
		});

		QUnit.test("with an async hint for sap.ui.fl but without a cachebusterToken", function(assert) {
			var oAsyncHints = {
				requests: [
					{
						name: "sap.ui.fl.changes",
						reference: sReference
					}
				]
			};
			assert.equal(ManifestUtils.getCacheKeyFromAsyncHints(sReference, oAsyncHints), "<NO CHANGES>", "'<NO CHANGES>' is returned");
		});
	});

	QUnit.module("ManifestUtils.getPreviewSectionFromAsyncHints", {}, function() {
		QUnit.test("without async hints given", function(assert) {
			assert.equal(ManifestUtils.getPreviewSectionFromAsyncHints({}), undefined, "nothing is returned");
		});

		QUnit.test("with filled async hints given but without a preview", function(assert) {
			var oAsyncHints = {
				requests: [
					{
						name: "sap.ui.fl.changes",
						reference: sReference,
						cachebusterToken: "token"
					}
				]
			};
			assert.equal(ManifestUtils.getPreviewSectionFromAsyncHints(oAsyncHints), undefined, "nothing is returned");
		});

		QUnit.test("with filled async hints given a preview is present", function(assert) {
			var oPreview = {};
			var oAsyncHints = {
				requests: [
					{
						name: "sap.ui.fl.changes",
						reference: sReference,
						cachebusterToken: "token",
						preview: oPreview
					}
				]
			};
			assert.equal(ManifestUtils.getPreviewSectionFromAsyncHints(oAsyncHints), oPreview, "the preview section is returned");
		});
	});

	QUnit.module("ManifestUtils.getChangeManifestFromAsyncHints", {}, function() {
		QUnit.test("without async hints given", function(assert) {
			assert.equal(ManifestUtils.getChangeManifestFromAsyncHints({}), true, "true is returned");
		});

		QUnit.test("with filled async hints", function(assert) {
			var oAsyncHints = {
				requests: [
					{
						name: "sap.ui.fl.changes",
						reference: sReference,
						cachebusterToken: "token"
					}
				]
			};
			assert.equal(ManifestUtils.getChangeManifestFromAsyncHints(oAsyncHints), false, "true is returned");
		});
	});

	QUnit.module("ManifestUtils.getBaseComponentNameFromManifest", {
		beforeEach: function() {
			this.oGetAppIdStub = sandbox.stub(Utils, "getAppIdFromManifest").returns("appId");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("without sap.ui5 entry", function(assert) {
			assert.equal(ManifestUtils.getBaseComponentNameFromManifest({}), "appId", "the appId is returned");
			assert.equal(this.oGetAppIdStub.callCount, 1, "the function was called once");
		});

		QUnit.test("with sap.ui5 entry and componentName", function(assert) {
			var oManifest = {
				"sap.ui5": {
					componentName: "componentName"
				}
			};
			assert.equal(ManifestUtils.getBaseComponentNameFromManifest(oManifest), "componentName", "the componentName is returned");
			assert.equal(this.oGetAppIdStub.callCount, 0, "the function was not called");
		});

		QUnit.test("with sap.ui5 entry but without componentName", function(assert) {
			var oManifest = {
				"sap.ui5": {
					name: "name"
				}
			};
			assert.equal(ManifestUtils.getBaseComponentNameFromManifest(oManifest), "appId", "the appId is returned");
			assert.equal(this.oGetAppIdStub.callCount, 1, "the function was called once");
		});
	});

	QUnit.module("ManifestUtils.getOvpEntity", {}, function() {
		QUnit.test("with a manifest JSON", function(assert) {
			var oOvpEntry = {};
			assert.equal(ManifestUtils.getOvpEntry({"sap.ovp": oOvpEntry}), oOvpEntry, "the sap.ovp object is returned");
		});

		QUnit.test("with a manifest object", function(assert) {
			var oOvpEntry = {
				property: "value"
			};
			var oManifest = new Manifest({
				"sap.ovp": oOvpEntry
			});
			assert.deepEqual(ManifestUtils.getOvpEntry(oManifest), oOvpEntry, "the sap.ovp object is returned");
		});
	});

	QUnit.module("ManifestUtils.isFlexExtensionPointHandlingEnabled", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("without existing appComponent", function(assert) {
			var oGetAppComponentForControlStub = sandbox.stub(Utils, "getAppComponentForControl").returns(undefined);
			assert.notOk(ManifestUtils.isFlexExtensionPointHandlingEnabled({}), "the extension point handling is disabled");
			assert.equal(oGetAppComponentForControlStub.callCount, 1, "the function was called once");
		});
		QUnit.test("without 'flexExtensionPointEnabled' flag is set", function(assert) {
			var oGetAppComponentForControlStub = sandbox.stub(Utils, "getAppComponentForControl").returns(createAppComponent(false));
			assert.notOk(ManifestUtils.isFlexExtensionPointHandlingEnabled({}), "the extension point handling is disabled");
			assert.equal(oGetAppComponentForControlStub.callCount, 1, "the function was called once");
		});
		QUnit.test("with 'flexExtensionPointEnabled' flag is set", function(assert) {
			var oGetAppComponentForControlStub = sandbox.stub(Utils, "getAppComponentForControl").returns(createAppComponent(true));
			assert.ok(ManifestUtils.isFlexExtensionPointHandlingEnabled({}), "the extension point handling is enabled");
			assert.equal(oGetAppComponentForControlStub.callCount, 1, "the function was called once");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
