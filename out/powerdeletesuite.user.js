// ==UserScript==
// @name         Power Delete Suite
// @namespace    pdsneo
// @version      1.0
// @description  Delete and edit Reddit posts and comments from your overview page.
// @author       ApexDevelopment
// @match        https://old.reddit.com/user/*/overview
// @match        https://old.reddit.com/user/*/overview/
// @grant        none
// @run-at       document-end
// ==/UserScript==
// Fork of Power Delete Suite by /u/j0be: https://github.com/j0be/PowerDeleteSuite

var pd = {
	version: GM_info.script.version,
	init: function () {
		pd.checks.versions();
		if (window.pd_processing !== true) {
			if (pd.checks.location()) {
				$("#pd__central").find(".complete,.processing").hide();
				$("#pd__form").show();
				pd.setup.basicSettings();
				pd.setup.applyDom();
			} else {
				if (
					confirm(
						"This script can only be run from your own user profile on reddit. Would you like to go there now?",
					)
				) {
					document.location = "https://old.reddit.com/u/me/overview";
				}
			}
		}
	},
	checks: {
		versions: function () {
			function checkAppVersion() {
				pd.prevRunVersion = localStorage.getItem("pd_ver") ? localStorage.getItem("pd_ver") : "0";
				localStorage.setItem("pd_ver", pd.version);
				if (pd.version !== pd.prevRunVersion) {
					if (
						confirm(
							"You've gotten the latest update! You are now running PowerDeleteSuiteNeo v" +
								pd.version +
								". Would you like to open the changelog in a new tab?",
						)
					) {
						window.open("https://github.com/ApexDevelopment/PowerDeleteSuiteNeo/releases");
					}
				}
				return true;
			}
			return pd.debugging || checkAppVersion();
		},
		location: function () {
			return (
				document.location.hostname.split(".").slice(-2).join(".") == "reddit.com" &&
				document.location.href.match("/user/") &&
				document.location.href.match("/overview") &&
				$(".titlebox h1").first().text() === $("#header-bottom-right .user a").first().text()
			);
		},
	},
	setup: {
		basicSettings: function () {
			pd.config = {
				uh: $("#config").innerHTML
					? $("#config")
							.innerHTML.replace(/.*?modhash.{1}: .{1}/, "")
							.replace(/[^a-z0-9].*/, "")
					: $("#config")[0]
							.innerHTML.replace(/.*?modhash.{1}: .{1}/, "")
							.replace(/[^a-z0-9].*/, ""),
				user: $("#header-bottom-right .user a").first().text(),
			};
			pd.endpoints = {
				comments: "/user/" + pd.config.user + "/comments/.json",
				submissions: "/user/" + pd.config.user + "/submitted/.json",
				search: "/search.json",
			};
		},
		applyDom: function () {
			if (pd.debugging) {
				$("#pd__central,#pd__style").remove("");
			}
			document.title = pd.config.user + " | Power Delete Suite";
			$(window).on("error", pd.error);

			$(".sitetable,.neverEndingReddit").remove();
			if ($("#pd__central").length === 0) {
				$("body>.content[role='main']").append("<div id='pd__central' />");
			}
			if ($("#pd__style").length === 0) {
				$("head").first().append("<style id='pd__style' />");
			}
			pd.setup.applyStyles();
			pd.setup.applyCentral();
		},
		applyStyles: function () {
			$("#pd__style")[0].textContent = `#pd__central {
	background: #fff;
	border: 1px solid #ddd;
	border-radius: 1em;
	line-height: 2em;
	margin: 20px;
	margin-right: 320px;
	padding: 20px;
}

.goodbye::after,
.goodbye2::after,
#pd__central::after {
	content: "";
	clear: left;
	display: block;
}

.goodbye2 {
	display: none;
}

.complete[style*="block"] .goodbye2 {
	display: block;
}

.submit-bug {
	float: left;
	width: 50%;
	padding: 20px;
	box-sizing: border-box;
}

.faq {
	float: left;
	width: 50%;
}

.faq blockquote {
	border-left: 3px solid #09f;
	padding-left: 1.2em;
	margin: .5em 0;
}
.faq p {
	line-height: 1.1em;
	text-indent: 1.5em;
}

.xt {
	display: none;
}
.xt:checked~.xtr-section {
	display: block;
}
.xt~label::after {
	color: #09f;
	content: "+";
	font-weight: bold;
	margin-left: .2em;
}
.xt:checked~label::after {
	content: "-";
}
.xt.xtr {
	display: inline-block;
}
.ind {
	margin-left: 1em !important;
}
#pd__central input[type="checkbox"] {
	margin-right: .5em;
	position: relative;
	top: 3px;
}
b.m {
	color: #590;
	margin-right: .4em;
}
#pd__central a {
	cursor: pointer;
}
.xtr-section {
	background: #eee;
	display: none;
	max-height: 20em;
	overflow-y: auto;
	padding: .5em 1em;
}
#pd__central textarea {
	min-height: 3em;
	min-width: 200px;
	width: 50%;
}
#pd__central .label {
	display: block;
	text-align: center;
}
#pd__central .progress {
	border: 1px solid #ccc;
	border-radius: 0.5em;
	height: 2em;
	margin-bottom: 1em;
	position: relative;
}
#pd__central .bar,
#pd__central .text {
	display: block;
	height: 100%;
	left: 0;
	position: absolute;
	top: 0;
}
#pd__central .bar {
	background: #def;
	z-index: 0;
}
#pd__central .text {
	text-align: center;
	width: 100%;
	z-index: 1;
}

#pd__central .text::before {
	content: attr(data-top)"/"attr(data-bottom);
}

.processing {
	display: none;
}

.xtr-section a {
	text-decoration: underline;
}

.xtr-section a.disabled,
.xtr-section a.loading {
	color: #999;
}

.gt-toggle+label {
	cursor: pointer;
	border-bottom: 1px dashed #333;
}

.gt-toggle+label::before {
	content: "Less than";
}
.gt-toggle.greater+label::before {
	content: "Greater than";
}

#pd__date-selector .gt-toggle+label::before {
	content: "Older than";
}
#pd__date-selector .gt-toggle.greater+label::before {
	content: "Newer than";
}

.hidden {
	display: none;
}

/* Subreddit Style */

.linkflairlabel {
	max-width: none !important;
}
.titlebox a {
	color: #64b2ff;
	text-decoration: underline;
}
.side {
	position: relative;
	padding-left: 20px;
	z-index: 15;
}

.listing-page .stickied+.clearleft+.linkflair-old,
.listing-page .stickied+.linkflair-old {
	margin-top: 80px;
	position: relative;
	overflow: visible !important;
}

.listing-page .stickied+.clearleft+.linkflair-old::before,
.listing-page .stickied+.linkflair-old::before {
	content: "Old Versions";
	display: block;
	position: absolute;
	top: -2em;
	left: 0;
	font-weight: bold;
	font-size: 14px;
	border-bottom: 1px solid;
	width: 100%;
}

.debugging {
	display: none;
}

.progress__byline {
	display: table;
	border-collapse: collapse;
	width: 100%;
	margin-top: 2em;
}

.progress__byline .row {
	display: table-row;
	width: 100%;
}

.progress__byline .row .type {
	display: none;
	border-top: 1px solid #ccc;
	text-align: center;
	font-size: 10px;
}

.progress__byline .row .type.visible {
	display: table-cell;
}

.progress__byline .row .type .num::before {
	content: attr(data-num);
}

.progress__byline .num {
	display: block;
	font-weight: bold;
	font-size: 1.2em;
}

.progress__byline .ignored .reasons {
	margin: 0;
	padding: 0;
	line-height: 1em;
	color: #999;
}
.progress__byline .ignored .reasons *::after {
	content: attr(data-num);
}

#progress__item-output.onecol > div {
	width: 100%;
}

#progress__item-output.twocol > div {
	float: left;
	width: 50%;
}

#progress__item-output::after {
	content: "";
	display: block;
	clear: both;
}

#progress__item-output a {
	display: block;
}

#pd__central hr {
	margin: 2em 0 1em;
}

.export-button {
	display: block;
	width: 250px;
	text-align: center;
	background: #09f;
	color: #fff;
	font-size: 14px;
	padding: 5px;
	margin: 0 auto;
	border-radius: 4px;
	font-weight: bold;
}
`;
			$("#pd__central").show();
		},
		applyCentral: function () {
			$("#pd__central").html(`<h2>Power Delete Suite</h2>
<form id="pd__form">
  <p>
    Please review all options before pressing "Process". This process is <b>NOT</b> reversible.
  </p>
  <hr/>
  
  <h3>Actions to perform</h3>
  <div><input checked type="checkbox" id="pd__export" name="pd__export"><label for="pd__export">Prepare local backup of items</label></div>
  <div><input checked type="checkbox" id="pd__submissions" name="pd__submissions"><label for="pd__submissions">Remove submissions</label></div>
  <div><input checked type="checkbox" id="pd__comments" name="pd__comments"><label for="pd__comments">Remove comments</label></div>
  <div data-help="If editing is enabled at the same time as deleting, the item will be edited BEFORE deleting it.">
    <input class="xt xtr" type="checkbox" id="pd__comments-edit" name="pd__comments-edit"><label for="pd__comments-edit">Edit comments / self posts</label><a class="pd__q">?</a>
    <div id="edit-form" class="xt xtr-section">
      <textarea placeholder="Enter text to edit comments or self posts to." id="pd__comments-edit-text" name="pd__comments-edit-text"></textarea>
    </div>
  </div>
  <hr/>

  <h3>Filters</h3>
  <div>
    <input class="xt xtr" type="checkbox" id="pd__subreddits" name="pd__subreddits"><label for="pd__subreddits">Filter by subreddits</label>
    <div id="pd__sub-list" class="xt xtr-section">
      <b>Perform actions on any subreddit that is checked:</b>
    </div>
  </div>
  <div>
    <input class="xt xtr" type="checkbox" id="pd__score" name="pd__score"><label for="pd__score">Filter by score</label>
    <div id="pd__score-selector" class="xtr-section">
      <div><b>Perform actions on items with a score:</b></div>
      <input class="gt-toggle hidden greater" id="pd__score-dirtoggle" name="pd__score-dirtoggle" type="checkbox" checked /><label for="pd__score-dirtoggle" title="toggle"></label> <input id="pd__score-num" type="tel" placeholder="200" name="pd__score-num" class="num-only"/>
    </div>
  </div>
  <div>
    <input class="xt xtr" type="checkbox" id="pd__date" name="pd__date"><label for="pd__date">Filter by date</label>
    <div id="pd__date-selector" class="xtr-section">
      <div><b>Perform actions on items with a date time:</b></div>
      <input class="gt-toggle hidden greater" id="pd__date-dirtoggle" name="pd__date-dirtoggle" type="checkbox" checked /><label for="pd__date-dirtoggle" title="toggle"></label> <input id="pd__date-num" type="tel" placeholder="60" value="60" name="pd__date-num" class="num-only"/> <span>minutes ago</span>
       <div>Set to: <a class="pd__insert" data-target="#pd__date-num" data-value="60">1 hour</a>
       <a class="pd__insert" data-target="#pd__date-num" data-value="1440">1 day</a>
       <a class="pd__insert" data-target="#pd__date-num" data-value="10080">1 week</a>
       <a class="pd__insert" data-target="#pd__date-num" data-value="43200">30 days</a>
       <a class="pd__insert" data-target="#pd__date-num" data-value="262800">half year</a>
       <a class="pd__insert" data-target="#pd__date-num" data-value="525600">year</a></div>
    </div>
  </div>
  <div><input checked type="checkbox" id="pd__gilded" name="pd__gilded"><label for="pd__gilded">Do not perform actions on gilded</label></div>
  <div><input checked type="checkbox" id="pd__saved" name="pd__saved"><label for="pd__saved">Do not perform actions on saved</label></div>
  <div><input checked type="checkbox" id="pd__mod" name="pd__mod"><label for="pd__mod">Do not perform actions on mod distinguished</label></div>
  <hr/>
  <div>
    <button>Process</button><input checked type="checkbox" id="pd__remember" name="pd__remember" class="ind"><label for="pd__remember" data-help="This will store data on your local computer. It will NOT transmit any of this data.">Remember Settings<a class="pd__q">?</a></label>
  </div>
</form>


<div class="processing">
  <span class="label">Page Progress</span>
  <div id="progress_page" class="progress">
    <span class="bar"></span>
    <span class="text" data-top="" data-bottom=""></span>
  </div>
  <span class="label">Page Item Progress</span>
  <div id="progress_item" class="progress">
    <span class="bar"></span>
    <span class="text" data-top="" data-bottom=""></span>
  </div>
  <div class="progress__byline"><div class="row">
     <span class="type errors"><span class="num" data-num=""></span> errors</span>
     <span class="type exported"><span class="num" data-num=""></span> exported</span>
     <span class="type edited"><span class="num" data-num=""></span> edited</span>
     <span class="type deleted"><span class="num" data-num=""></span> deleted</span>
     <span class="type ignored"><span class="num" data-num=""></span> ignored<span class="reasons"></span></span>
  </div></div>
</div>


<div class="complete">
  <div class="summary"></div>
  <div class="progress__byline"><div class="row">
     <span class="type errors"><span class="num" data-num=""></span> errors</span>
     <span class="type exported"><span class="num" data-num=""></span> exported</span>
     <span class="type edited"><span class="num" data-num=""></span> edited</span>
     <span class="type deleted"><span class="num" data-num=""></span> deleted</span>
     <span class="type ignored"><span class="num" data-num=""></span> ignored<span class="reasons"></span></span>
  </div></div>
  <div class="goodbye"></div>
</div>`);
			if (pd.debugging) {
				$("#pd__central").find(".debugging").removeClass("debugging");
			}
			$("#pd__central h2").first().text("Power Delete Suite v" + pd.version);
			pd.setup.applySubList();
			pd.setup.applySkipFilter();
			$("#pd__comments-edit-text").attr("placeholder", "leave blank for random text");
			pd.setup.bindUI();
			pd.helpers.restoreSettings();
		},
		applySkipFilter: function () {
			$(
				"<div>" +
					'<input type="checkbox" id="pd__skip" name="pd__skip" />' +
					'<label for="pd__skip"> Skip first </label>' +
					'<input type="text" id="pd__skip-num" class="ind num-only" name="pd__skip-num" />' +
					'<label for="pd__skip-num"> posts/comments</label>' +
					"</div>",
			).insertAfter($("#pd__date").parent());
		},
		applySubList: function () {
			var sub_arr = [],
				i,
				sid;
			$("#per-sr-karma tbody th").each(function () {
				sub_arr.push($(this).text());
			});
			sub_arr = sub_arr.sort(function (a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			});
			$("#pd__sub-list").append(
				'<div><a class="ind mass_sel sel_all">Select All</a><a class="ind mass_sel sel_none">Select None</a></div>',
			);
			for (i = 0; i < sub_arr.length; i++) {
				sid = "sub--" + sub_arr[i];
				$("#pd__sub-list").append(
					"<div><input class='ind' data-sub='" +
						sub_arr[i] +
						"' type='checkbox' name='" +
						sid +
						"' id='" +
						sid +
						"''/><label class='" +
						sid +
						"' for='" +
						sid +
						"'>" +
						sub_arr[i] +
						"</label></div>",
				);
			}
			$("#side-mod-list li").each(function () {
				$(
					".sub--" +
						$(this)
							.text()
							.replace(/\/?[ru]\//, ""),
				).prepend("<b class='m'>[M]</b>");
			});
		},
		createProcessStream: function () {
			window.pd_processing = true;
			pd.ignoreErrors = false;
			pd.skipIds = new Set();
			pd.exportItems = [];
			pd.exportIds = [];
			pd.task = {
				after: "",
				info: {
					numPages: Math.min(
						($("#pd__submissions").is(":checked") ? 8 : 0) +
							($("#pd__comments").is(":checked") ? 4 : 0) +
							($("#pd__comments-edit").is(":checked") ? 12 : 0),
						12,
					),
					numItems: 0,
					donePages: 0,
					doneItems: 0,

					pageCalls: 0,
					edited: 0,
					deleted: 0,
					errors: 0,
					ignored: 0,
					exported: 0,
					actionIndex: 0,
					ignoreReasons: {
						subs: 0,
						gold: 0,
						saved: 0,
						mod: 0,
						score: 0,
						date: 0,
						skip: 0,
					},
				},
				config: {
					isExporting: $("#pd__export").is(":checked"),
					isRemovingPosts: $("#pd__submissions").is(":checked"),
					isRemovingComments: $("#pd__comments").is(":checked"),
					isEditing: $("#pd__comments-edit").is(":checked"),
					editText: $("#pd__comments-edit-text").val(),
				},
				paths: {
					sections:
						!$("#pd__submissions").is(":checked") && !$("#pd__export").is(":checked")
							? [
									"comments",
									"search",
									"submissions",
								] /* Search is actually more efficient than submissions if we're not handling submissions (`self:1`) */
							: ["comments", "submissions", "search"],
					sorts: ["new", "hot", "top", "controversial"],
					timeframes: ["all", "hour", "day", "week", "month", "year"],
				},
			};
			pd.filters = {
				subs: {
					enabled: $("#pd__subreddits").is(":checked"),
					list: $("#pd__sub-list input" + ($("#pd__subreddits").is(":checked") ? ":checked" : "")).map(
						function () {
							return $(this).attr("data-sub");
						},
					),
				},
				score: {
					enabled: $("#pd__score").is(":checked"),
					gt: $("#pd__score-dirtoggle").is(":checked"),
					num: parseFloat($("#pd__score-num").val()),
				},
				date: {
					enabled: $("#pd__date").is(":checked"),
					gt: $("#pd__date-dirtoggle").is(":checked"),
					num: Math.floor(new Date().getTime() / 1000) - parseFloat($("#pd__date-num").val()) * 60,
				},
				gilded: $("#pd__gilded").is(":checked"),
				saved: $("#pd__saved").is(":checked"),
				mod: $("#pd__mod").is(":checked"),
				skip: {
					enabled: $("#pd__skip").is(":checked"),
					num: parseInt($("#pd__skip-num").val(), 10) || 0,
				},
			};
		},
		resetSorts: function () {
			pd.task.paths.sorts = ["new", "hot", "top", "controversial"];
		},
		resetTimes: function () {
			pd.task.paths.timeframes = ["all", "hour", "day", "week", "month", "year"];
		},
		bindUI: function () {
			$("#pd__form").submit(function (e) {
				e.preventDefault();
				pd.setup.createProcessStream();
				var validation = pd.helpers.validate();
				window.pd_processing = validation.valid;
				if (validation.valid) {
					$("#pd__central .complete, #pd__form").hide();
					$("#pd__central .processing").show();
					pd.actions.prefetchSkipIds(function () {
						pd.actions.page.next();
					});
				} else {
					alert(validation.reason);
				}
			});
			$(".pd__q").click(function (e) {
				e.preventDefault();
				alert($(this).closest("[data-help]").attr("data-help"));
			});
			$("#pd__form input").change(function () {
				pd.helpers.saveSettings();
			});
			$(".mass_sel").click(function () {
				$(this).closest(".xtr-section").find("input").prop("checked", $(this).hasClass("sel_all"));
				pd.helpers.saveSettings();
			});
			$(".gt-toggle").change(function () {
				var greaterThan = $(this).hasClass("greater");
				$(this).attr("class", "gt-toggle hidden " + (greaterThan ? "less" : "greater"));
			});
			$(".num-only").blur(function () {
				$(this).val(
					$(this)
						.val()
						.replace(/[^\d-]/g, ""),
				);
				$(this).change();
			});
			$(".pd__insert").click(function () {
				$($(this).attr("data-target")).val($(this).attr("data-value")).change();
			});
		},
	},
	helpers: {
		validate: function () {
			if (pd.task.config.isEditing && pd.task.config.editText === "") {
				var confirmEmptyEdit = window.confirm(
					'You haven\'t entered replacement text. Each post/comment will be overwritten with six random words followed by:\n\n"This post has been redacted."\n\nContinue?',
				);
				return {
					valid: !!confirmEmptyEdit,
					reason: confirmEmptyEdit
						? "valid"
						: "Please enter something to edit your comments / self posts to.",
				};
			} else if (pd.filters.score && $("#pd_score-num").val() === "") {
				return { valid: false, reason: "Please enter a score to filter with." };
			} else if (
				!(
					pd.task.config.isRemovingPosts ||
					pd.task.config.isEditing ||
					pd.task.config.isRemovingComments ||
					pd.task.config.isExporting
				)
			) {
				return {
					valid: false,
					reason: "There are no actions chosen, so we've got nothing to do. Please select an action.",
				};
			}
			return { valid: true, reason: "valid" };
		},
		shouldBeActedOn: function (item) {
			if (pd.filters.skip.enabled && pd.skipIds.has(item.data.id)) {
				pd.task.info.ignoreReasons.skip++;
				return false;
			}
			var check = {
				subs:
					!pd.filters.subs.enabled ||
					(pd.filters.subs.enabled && $.inArray(item.data.subreddit, pd.filters.subs.list) >= 0),
				gold: !(pd.filters.gilded && item.data.gilded == 1),
				saved: !(pd.filters.saved && item.data.saved == true),
				mod: !(pd.filters.mod && item.data.distinguished != null),
				score:
					!pd.filters.score.enabled ||
					(pd.filters.score.enabled &&
						((pd.filters.score.gt === true && parseFloat(item.data.score) > pd.filters.score.num) ||
							(pd.filters.score.gt === false && parseFloat(item.data.score) < pd.filters.score.num))),
				date:
					!pd.filters.date.enabled ||
					(pd.filters.date.enabled &&
						((pd.filters.date.gt === true && parseFloat(item.data.created_utc) > pd.filters.date.num) ||
							(pd.filters.date.gt === false && parseFloat(item.data.created_utc) < pd.filters.date.num))),
			};
			for (var key in check) {
				if (!check[key]) {
					pd.task.info.ignoreReasons[key]++;
					pd.task.items[0].pdIgnoreReasons = check;
				}
			}
			var passes = check.subs && check.gold && check.saved && check.mod && check.score && check.date;
			if (passes && pd.filters.skip.enabled && pd.task.info.actionIndex++ < pd.filters.skip.num) {
				pd.skipIds.add(item.data.id);
				pd.task.info.ignoreReasons.skip++;
				return false;
			}
			return passes;
		},
		passesFilters: function (item) {
			return (
				(!pd.filters.subs.enabled ||
					$.inArray(item.data.subreddit, pd.filters.subs.list) >= 0) &&
				!(pd.filters.gilded && item.data.gilded == 1) &&
				!(pd.filters.saved && item.data.saved == true) &&
				!(pd.filters.mod && item.data.distinguished != null) &&
				(!pd.filters.score.enabled ||
					(pd.filters.score.gt === true &&
						parseFloat(item.data.score) > pd.filters.score.num) ||
					(pd.filters.score.gt === false &&
						parseFloat(item.data.score) < pd.filters.score.num)) &&
				(!pd.filters.date.enabled ||
					(pd.filters.date.gt === true &&
						parseFloat(item.data.created_utc) > pd.filters.date.num) ||
					(pd.filters.date.gt === false &&
						parseFloat(item.data.created_utc) < pd.filters.date.num))
			);
		},
		errorConfirm: function (message, continueCallback, cancelCallback) {
			if (pd.ignoreErrors) {
				continueCallback();
				return;
			}
			if (confirm(message)) {
				continueCallback();
			} else {
				if (confirm("Would you like to ignore all future errors and continue processing?")) {
					pd.ignoreErrors = true;
					continueCallback();
				} else {
					cancelCallback();
				}
			}
		},
		generateEditString: function () {
			var words = [
				"time",
				"year",
				"people",
				"way",
				"day",
				"man",
				"woman",
				"child",
				"world",
				"life",
				"hand",
				"part",
				"place",
				"case",
				"week",
				"company",
				"system",
				"question",
				"work",
				"government",
				"number",
				"night",
				"point",
				"home",
				"water",
				"room",
				"area",
				"money",
				"story",
				"fact",
				"month",
				"right",
				"study",
				"book",
				"eye",
				"job",
				"word",
				"business",
				"issue",
				"side",
				"kind",
				"head",
				"house",
				"service",
				"friend",
				"father",
				"power",
				"hour",
				"game",
				"line",
				"end",
				"plan",
				"order",
				"term",
				"group",
				"voice",
				"door",
				"town",
				"table",
				"face",
				"air",
				"force",
				"school",
				"road",
				"body",
				"light",
				"food",
				"state",
				"city",
				"name",
				"idea",
				"fire",
				"sea",
				"river",
				"street",
				"morning",
				"car",
				"age",
				"girl",
				"boy",
				"bird",
				"flower",
				"tree",
				"mountain",
				"paper",
				"color",
				"music",
				"heart",
				"window",
				"stone",
				"field",
				"cloud",
				"rain",
				"wind",
				"ground",
				"sun",
				"moon",
				"star",
				"lake",
				"hill",
			];
			var result = [];
			for (var i = 0; i < 6; i++) {
				result.push(words[Math.floor(Math.random() * words.length)]);
			}
			return result.join(" ") + "\n\nThis post has been redacted.";
		},
		csvEscape: function (str) {
			return str.replace(/#/g, "%23").replace(/'/g, "`").replace(/"/g, '""');
		},
		csvCell: function (str) {
			return '"' + str + '",';
		},
		getSettings: function () {
			return localStorage.getItem("pd_storage")
				? JSON.parse(localStorage.getItem("pd_storage"))
				: false;
		},
		restoreSettings: function () {
			var settings = pd.helpers.getSettings(),
				rememberSettings = $("#pd__remember").is(":checked");
			if (settings !== false && rememberSettings) {
				$("#pd__form input").prop("checked", false).val(""); //Reset all
				for (var i = 0; i < settings.length; i++) {
					var setting = settings[i],
						selector = "*[name='" + setting.name + "']";
					if (setting.value == "on" || setting.value === "") {
						$(selector).prop("checked", true);
					} else {
						$(selector).val(setting.value);
					}
				}
				$(".gt-toggle").not(":checked").change();
			}
		},
		saveSettings: function () {
			if ($("#pd__remember").is(":checked")) {
				if (!$("#pd__subreddits").is(":checked")) {
					$("#pd__sub-list input").prop("checked", false);
				}
				localStorage.setItem("pd_storage", JSON.stringify($("#pd__form").serializeArray()));
			} else {
				localStorage.removeItem("pd_storage");
			}
		},
	},
	actions: {
		prefetchSkipIds: function (callback) {
			if (!pd.filters.skip.enabled || pd.filters.skip.num <= 0) {
				callback();
				return;
			}
			var N = pd.filters.skip.num;
			var sections = pd.task.paths.sections.slice();
			var sectionState = {};
			sections.forEach(function (s) {
				sectionState[s] = { after: "", done: false, oldestFetched: Infinity };
			});
			var seen = {};
			var qualifyingItems = [];

			function fetchOne(section, attempt) {
				attempt = attempt || 0;
				var state = sectionState[section];
				var deferred = $.Deferred();
				$.ajax({
					url: pd.endpoints[section],
					data: {
						q:
							section == "search"
								? "author:" +
									pd.config.user +
									(!pd.task.config.isRemovingPosts && !pd.task.config.isExporting
										? " self:1"
										: "")
								: null,
						after: state.after,
						sort: "new",
						t: "all",
					},
				}).then(
					function (data) {
						if (!data || !data.data || data.data.children.length === 0) {
							state.done = true;
						} else {
							var children = data.data.children;
							state.after = children[children.length - 1].data.name;
							state.oldestFetched = children[children.length - 1].data.created_utc;
							children.forEach(function (item) {
								if (!seen[item.data.id] && pd.helpers.passesFilters(item)) {
									seen[item.data.id] = true;
									qualifyingItems.push({
										id: item.data.id,
										created_utc: item.data.created_utc,
									});
								}
							});
						}
						deferred.resolve();
					},
					function (jqXHR) {
						if (jqXHR.status === 429 && attempt < 6) {
							setTimeout(function () {
								fetchOne(section, attempt + 1).then(deferred.resolve, deferred.reject);
							}, Math.min(Math.pow(2, attempt + 1) * 1000, 64000));
						} else {
							state.done = true;
							deferred.resolve();
						}
					},
				);
				return deferred.promise();
			}

			function round() {
				var pending = sections.filter(function (s) {
					return !sectionState[s].done;
				});
				if (pending.length === 0) {
					finish();
					return;
				}
				$.when.apply(
					$,
					pending.map(function (s) {
						return fetchOne(s);
					}),
				).then(function () {
					qualifyingItems.sort(function (a, b) {
						return b.created_utc - a.created_utc;
					});
					if (qualifyingItems.length >= N) {
						var cutoff = qualifyingItems[N - 1].created_utc;
						var allPastCutoff = sections.every(function (s) {
							return sectionState[s].done || sectionState[s].oldestFetched <= cutoff;
						});
						if (allPastCutoff) {
							finish();
							return;
						}
					}
					round();
				});
			}

			function finish() {
				qualifyingItems.slice(0, N).forEach(function (item) {
					pd.skipIds.add(item.id);
				});
				pd.task.info.actionIndex = N;
				callback();
			}

			round();
		},
		page: {
			next: function () {
				if (pd.debugging && pd.task.info.donePages % 5 == 3) {
					pd.actions.page.shift();
				}
				if (pd.task.paths.sections.length > 0) {
					pd.ui.updateDisplay();
					pd.actions.page.handle();
				} else {
					pd.ui.done();
				}
			},
			shift: function () {
				if (pd.task.paths.sorts[0] === "top" || pd.task.paths.sorts[0] === "controversial") {
					pd.task.paths.timeframes.splice(0, 1);
					if (pd.task.paths.timeframes.length === 0) {
						pd.setup.resetTimes();
						pd.task.paths.sorts.splice(0, 1);
						if (pd.task.paths.sorts.length === 0) {
							pd.setup.resetSorts();
							pd.task.paths.sections.splice(0, 1);
						}
					}
					return false;
				}

				pd.task.paths.sorts.splice(0, 1);
				if (pd.task.paths.sorts.length === 0) {
					pd.setup.resetSorts();
					pd.task.paths.sections.splice(0, 1);
				}
				return true;
			},
			handle: function (attempt) {
				attempt = attempt || 0;
				pd.task.pageCalls++;
				$.ajax({
					url: pd.endpoints[pd.task.paths.sections[0]],
					data: {
						q:
							pd.task.paths.sections[0] == "search"
								? "author:" +
									pd.config.user +
									(!pd.task.config.isRemovingPosts && !pd.task.config.isExporting ? " self:1" : "")
								: null,
						after: pd.task.after,
						sort: pd.task.paths.sorts[0],
						t: pd.task.paths.timeframes[0],
					},
				}).then(
					function (resp) {
						if (resp.data) {
							var children = resp.data.children;
							pd.task.info.donePages++;
							if (children.length > 0) {
								pd.task.info.doneItems = 0;
								pd.task.info.numItems = children.length;
								pd.task.items = children;
								pd.actions.children.handleGroup();
							} else {
								pd.task.after = "";
								pd.actions.page.shift();
								pd.actions.page.next();
							}
						} else {
							pd.task.info.errors++;
							pd.helpers.errorConfirm(
								"Reddit seems to be under heavy load. Would you like to continue processing?",
								function () {
									pd.actions.page.shift();
									pd.actions.page.handle();
								},
								function () {
									pd.ui.done();
								},
							);
						}
					},
					function (jqXHR) {
						if (jqXHR.status === 429) {
							setTimeout(
								function () {
									pd.actions.page.handle(attempt + 1);
								},
								Math.min(Math.pow(2, attempt + 1) * 1000, 64000),
							);
						} else {
							pd.task.info.errors++;
							pd.helpers.errorConfirm(
								"Error getting " + pd.task.paths.sections[0] + " page. Would you like to retry?",
								function () {
									pd.actions.page.handle();
								},
								function () {
									pd.actions.page.shift();
									pd.actions.page.next();
								},
							);
						}
					},
				);
			},
		},
		children: {
			handleGroup: function () {
				pd.ui.updateDisplay();
				if (pd.task.items.length > 0) {
					pd.actions.children.handleSingle();
				} else {
					pd.actions.page.next();
				}
			},
			handleSingle: function () {
				pd.ui.updateDisplay();
				var item = pd.task.items[0],
					shouldBeActedOn = pd.helpers.shouldBeActedOn(item),
					earlyExitNewItems =
						pd.task.paths.sorts[0] == "new" &&
						pd.filters.date.gt === true &&
						pd.task.items[0].pdIgnoreReasons &&
						!pd.task.items[0].pdIgnoreReasons.date;

				if (earlyExitNewItems) {
					console.log("Skipping the rest of the things sorted by new");
					pd.task.items[0].pdIgnored = true;
					pd.actions.children.finishItem();
					pd.actions.page.shift();
					pd.actions.page.next();
				} else if (shouldBeActedOn) {
					if (!item.pdEdited && (item.data.is_self || item.kind == "t1") && pd.task.config.isEditing) {
						pd.actions.edit(item);
					} else if (
						!item.pdDeleted &&
						((item.kind == "t3" && pd.task.config.isRemovingPosts) ||
							(item.kind == "t1" && pd.task.config.isRemovingComments))
					) {
						pd.actions.delete(item);
					} else {
						pd.actions.children.finishItem();
						pd.actions.children.handleGroup();
					}
				} else {
					pd.task.items[0].pdIgnored = true;
					pd.actions.children.finishItem();
					pd.actions.children.handleGroup();
				}
			},
			finishItem: function () {
				pd.task.after = pd.task.items[0].pdDeleted ? pd.task.after : pd.task.items[0].data.name;
				pd.task.info.doneItems++;
				pd.task.info.deleted += pd.task.items[0].pdDeleted ? 1 : 0;
				pd.task.info.edited += pd.task.items[0].pdEdited ? 1 : 0;
				pd.task.info.ignored += pd.task.items[0].pdIgnored ? 1 : 0;
				if (pd.task.config.isExporting && !pd.task.items[0].pdIgnored) {
					pd.actions.children.exportItem(pd.task.items[0]);
				}
				pd.task.items.splice(0, 1);
			},
			exportItem: function (item) {
				var str = "";
				if (pd.exportItems.length == 0) {
					str += pd.helpers.csvCell("Title");
					str += pd.helpers.csvCell("Body");
					str += pd.helpers.csvCell("Permalink");
					str += pd.helpers.csvCell("Score");
					str += pd.helpers.csvCell("Timestamp UTC");
					str += pd.helpers.csvCell("Actions");
					pd.exportItems.push(str);
				}

				if (pd.exportIds.indexOf(item.data.id) == -1) {
					str = "";
					str += pd.helpers.csvCell(pd.helpers.csvEscape(item.data.title ? item.data.title : ""));
					str += pd.helpers.csvCell(
						pd.helpers.csvEscape(
							item.data.body ? item.data.body : item.data.selftext ? item.data.selftext : "",
						),
					);
					str += pd.helpers.csvCell(
						item.data.permalink
							? "https://reddit.com" + item.data.permalink
							: "https://reddit.com/r/" +
									item.data.subreddit +
									"/comments/" +
									item.data.link_id.replace(/^t\d_/, "") +
									"/x/" +
									item.data.id +
									"?context=3",
					);
					str += pd.helpers.csvCell(item.data.score);
					str += pd.helpers.csvCell(item.data.created_utc);
					str += pd.helpers.csvCell(
						(item.pdEdited ? "edited " : "") + (item.pdDeleted ? "deleted " : ""),
					);
					pd.exportItems.push(str);
					pd.exportIds.push(item.data.id);
					pd.task.info.exported++;
				}
			},
		},
		delete: function (item, attempt) {
			attempt = attempt || 0;
			setTimeout(
				() => {
					if (pd.performActions) {
						$.ajax({
							url: "/api/del",
							method: "post",
							data: {
								id: item.data.name,
								executed: "deleted",
								uh: pd.config.uh,
								renderstyle: "html",
							},
						}).then(
							function () {
								pd.task.items[0].pdDeleted = true;
								pd.actions.children.handleSingle();
							},
							function (jqXHR) {
								if (jqXHR.status === 429) {
									setTimeout(
										function () {
											pd.actions.delete(item, attempt + 1);
										},
										Math.min(Math.pow(2, attempt + 1) * 1000, 64000),
									);
								} else {
									pd.task.info.errors++;
									pd.helpers.errorConfirm(
										"Error deleting " +
											(item.kind == "t3" ? "post" : "comment") +
											", would you like to retry?",
										function () {
											pd.actions.children.handleSingle();
										},
										function () {
											pd.actions.children.finishItem();
											pd.actions.children.handleGroup();
										},
									);
								}
							},
						);
					} else {
						pd.task.items[0].pdDeleted = true;
						pd.task.after = pd.task.items[0].data.name;
						pd.actions.children.handleSingle();
					}
				},
				attempt === 0 ? 5000 : 0,
			);
		},
		edit: function (item, attempt) {
			attempt = attempt || 0;
			setTimeout(
				() => {
					if (pd.performActions) {
						var editString = pd.task.config.editText || pd.helpers.generateEditString();
						$.ajax({
							url: "/api/editusertext",
							method: "post",
							data: {
								thing_id: item.data.name,
								text: editString,
								id: "#form-" + item.data.name,
								r: item.data.subreddit,
								uh: pd.config.uh,
								renderstyle: "html",
							},
						}).then(
							function () {
								pd.task.items[0].pdEdited = true;
								pd.actions.children.handleSingle();
							},
							function (jqXHR) {
								if (jqXHR.status === 429) {
									setTimeout(
										function () {
											pd.actions.edit(item, attempt + 1);
										},
										Math.min(Math.pow(2, attempt + 1) * 1000, 64000),
									);
								} else {
									pd.task.info.errors++;
									pd.helpers.errorConfirm(
										"Error editing " +
											(item.kind == "t3" ? "post" : "comment") +
											", would you like to retry?",
										function () {
											pd.actions.children.handleSingle();
										},
										function () {
											item.pdEdited = true;
											pd.actions.children.handleSingle();
										},
									);
								}
							},
						);
					} else {
						pd.task.items[0].pdEdited = true;
						pd.actions.children.handleSingle();
					}
				},
				attempt === 0 ? 5000 : 0,
			);
		},
	},
	ui: {
		updateDisplay: function () {
			$("#pd__central h2")
				.first()
				.html(
					"Power Delete Suite v" +
						pd.version +
						" <br/>" +
						"<small>" +
						pd.task.paths.sections[0] +
						"/" +
						pd.task.paths.sorts[0] +
						"/" +
						pd.task.paths.timeframes[0] +
						"</small>",
				);
			pd.task.info.numPages =
				pd.task.info.donePages + (pd.task.paths.sections.length - 1) * 4 + pd.task.paths.sorts.length;
			$("#progress_page .bar").css(
				"width",
				Math.round((1000 * pd.task.info.donePages) / pd.task.info.numPages) / 10 + "%",
			);
			$("#progress_page .text")
				.attr("data-top", pd.task.info.donePages)
				.attr("data-bottom", pd.task.info.numPages);
			if (pd.task.info.numItems > 0) {
				$("#progress_item .bar").css(
					"width",
					Math.round((1000 * pd.task.info.doneItems) / pd.task.info.numItems) / 10 + "%",
				);
				$("#progress_item .text")
					.attr("data-top", pd.task.info.doneItems)
					.attr("data-bottom", pd.task.info.numItems);
			}

			$(".progress__byline .edited")
				.addClass(pd.task.info.edited > 0 ? "visible" : "")
				.find(".num")
				.attr("data-num", pd.task.info.edited);
			$(".progress__byline .deleted")
				.addClass(pd.task.info.deleted > 0 ? "visible" : "")
				.find(".num")
				.attr("data-num", pd.task.info.deleted);
			$(".progress__byline .errors")
				.addClass(pd.task.info.errors > 0 ? "visible" : "")
				.find(".num")
				.attr("data-num", pd.task.info.errors);
			$(".progress__byline .exported")
				.addClass(pd.task.info.exported > 0 ? "visible" : "")
				.find(".num")
				.attr("data-num", pd.task.info.exported);
			$(".progress__byline .ignored")
				.addClass(pd.task.info.ignored > 0 ? "visible" : "")
				.find(".num")
				.attr("data-num", pd.task.info.ignored);
			for (var key in pd.task.info.ignoreReasons) {
				if (!!pd.task.info.ignoreReasons[key]) {
					if ($(".progress__byline .ignored .reasons ." + key).length == 0) {
						$(".progress__byline .ignored .reasons").prepend(
							'<div class="' + key + '">' + key + ": </div>",
						);
					}
					$(".progress__byline .ignored .reasons ." + key).attr(
						"data-num",
						pd.task.info.ignoreReasons[key],
					);
				}
			}

			$("#progress__item-output").attr(
				"class",
				pd.task.info.ignored > 0 && (pd.task.info.deleted > 0 || pd.task.info.edited > 0)
					? "twocol"
					: "onecol",
			);

			pd.task.info.ajaxCalls =
				pd.task.info.errors + pd.task.info.edited + pd.task.info.deleted + pd.task.info.donePages;
			document.title = pd.config.user + " | " + pd.task.info.ajaxCalls;
		},
		done: function () {
			pd.ui.updateDisplay();
			window.pd_processing = false;
			document.title = $("#header-bottom-right .user a").first().text() + " | Power Delete Suite";
			$("#pd__central h2")
				.first()
				.text("Power Delete Suite v" + pd.version);

			if (pd.task.info.edited + pd.task.info.deleted > 0 || pd.task.config.isExporting) {
				$("#pd__central .complete .summary").html(
					"<p>Completed after making " +
						pd.task.info.ajaxCalls +
						' calls to the reddit servers.</p> <p>If you need to re run the script, <a class="restart">click here to go back to the beginning!</a></p>',
				);
			} else {
				$("#pd__central .complete .summary").html(
					"<p>All Done! It seems like all " +
						pd.task.info.ignored +
						' items we came across were ignored.</p> <p>If you need to re run the script, <a class="restart">click here to go back to the beginning!</a></p>',
				);
			}
			$("#pd__central .complete .summary .restart").click(function () {
				pd.init();
			});

			var numSubs = $("#pd__sub-list input:checked").length;
			$("#pd__sub-list input").prop("checked", false);
			var debugInfo =
				JSON.stringify($("#pd__form").serializeArray()) + " number of subreddits: " + numSubs;

			$("#pd__central .complete .goodbye").html(
				'<hr/><h3 class="submit-bug">' +
					"<div>Having trouble?</div>" +
					'<div><a href="https://github.com/ApexDevelopment/PowerDeleteSuiteNeo/issues/new?body=' +
					encodeURIComponent(debugInfo) +
					'" target="_blank">Open an issue on GitHub with your current settings.</a></div>' +
					"<div><small>(for privacy, subreddit list is not included)</small></div>" +
					"</h3>",
			);

			if (pd.task.config.isExporting && pd.exportItems.length > 0) {
				$("#pd__central .complete .goodbye").prepend(
					'<hr/><a class="export-button" href=\'data:text/csv;charset=utf-8,' +
						pd.exportItems.join("%0A") +
						'\' download="PowerDeleteSuiteExport.csv">Download Exported Items</a>',
				);
			}

			$("#pd__central .processing, #pd__form").hide();
			$("#pd__central .complete").show();
		},
	},
	error: function () {
		var reset = confirm(
			"We ran into an error. Consider opening an issue at https://github.com/ApexDevelopment/PowerDeleteSuiteNeo/issues\r\n\r\nWould you like to restart the script?",
		);
		window.pd_processing = false;
		if (reset) {
			pd.init();
		}
		return true;
	},
	performActions: true,
	ignoreErrors: false,
	debugging: false,
};

(function () {
	var ul = document.querySelector("#header-bottom-right > ul.flat-list");
	if (!ul) return;
	var sep = ul.nextSibling;
	sep.parentNode.insertBefore(sep.cloneNode(true), sep.nextSibling);
	var a = document.createElement("a");
	a.id = "pd-launch";
	a.href = "#";
	a.textContent = "PDS";
	a.addEventListener("click", function (e) {
		e.preventDefault();
		pd.init();
	});
	sep.parentNode.insertBefore(a, sep.nextSibling);
})();
