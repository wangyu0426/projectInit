(function () {
	window.mtkColours = makeIt();
	function makeIt() {
		{
			//fix tinycolor so it automatically adds '#' to hex values
			var old_toHex = tinycolor.prototype.toHex;
			tinycolor.prototype.toHex = function () {
				var s = old_toHex.apply(this);
				if (s.charAt(0)!='#') return '#'+s;
				else return s;
			};
			//wrappers for tinycolor
			var mix = function () {
				return tinycolor.mix(arguments[0], arguments[1], arguments[2]).toHex();
			}, darken = function () {
				return tinycolor.darken(arguments[0], arguments[1]).toHex();
			}, lighten = function () {
				return tinycolor.lighten(arguments[0], arguments[1]).toHex();
			}, saturate = function () {
				return tinycolor.saturate(arguments[0], arguments[1]).toHex();
			}, alpha = function () {
				return tinycolor(arguments[0]).setAlpha(arguments[1]).toRgbString();
            };

			var mtk = {
				PrimaryBlue  : "#14cdeb",
				SecondaryBlue: "#1e7dc8",
				Navy         : "#466ea0",
				DarkGrey     : "#6e6e6e",
				LightGrey    : "#d2d2d2",
				Red          : "#f04623",
				Orange       : "#f5871e",
				Yellow       : "#e1e63c",
				Green        : "#a5c832",
				Gold         : "#EBAD10",
				mix			 : mix,
				darken		 :	darken,
				lighten: lighten,
				alpha		 : alpha

			};
			mtk.Danger = mtk.Red;
			mtk.Warning = mtk.Orange;
			mtk.Overdue = mtk.Gold;
			mtk.Info = mtk.SecondaryBlue;
			mtk.Success = mtk.Green;
			//added mixed versions
			mtk.Purple1 = saturate(mix(mtk.SecondaryBlue, mtk.Red, 10), 20);
			mtk.Purple2 = saturate(mix(mtk.SecondaryBlue, mtk.Red, 25), 20);
			mtk.Purple3 = saturate(mix(mtk.SecondaryBlue, mtk.Red, 40), 20);
			mtk.Purple4 = mix(mtk.PrimaryBlue, mtk.Red, 50);
			//add _faded versions
			for (var k in mtk) {
				if (k.indexOf('_faded') >= 0) {
					continue;
				}
				var c = mtk[k];
				mtk[k + "_faded"] = tinycolor.mix(c, 'white', 30).toHex();
			}
			mtk.WarningDanger = [mtk.Warning, mtk.Danger];
			mtk.DangerWarning = [mtk.Danger, mtk.Warning];
			mtk.DangerToGrey_4 = [mtk.Danger, mtk.Warning, mtk.Overdue, mtk.LightGrey];
			mtk.GreyToDanger_4 = mtk.DangerToGrey_4.clone().reverse();
			mtk.DangerToGrey_3 = [mtk.Danger, mtk.Warning, mtk.LightGrey];
			mtk.GreyToDanger_3 = mtk.DangerToGrey_3.clone().reverse();
			mtk.DangerToSuccess_4 = [mtk.Danger, mtk.Warning, mtk.Overdue, mtk.Success];
			mtk.SuccessToDanger_4 = mtk.DangerToSuccess_4.clone().reverse();
			mtk.DangerToSuccess_3 = [mtk.Danger, mtk.Warning, mtk.Success];
			mtk.SuccessToDanger_3 = mtk.DangerToSuccess_3.clone().reverse();
			mtk.BlueToGreen_4 = [mtk.Navy, mtk.SecondaryBlue, mtk.PrimaryBlue, mtk.Green];
			mtk.BlueToGreen_3 = [mtk.SecondaryBlue, mtk.PrimaryBlue, mtk.Green];
			mtk.BlueToGrey_3 = [mtk.PrimaryBlue, mtk.SecondaryBlue, mtk.LightGrey];
			mtk.YellowToGreen_3 = [mtk.Yellow, mix(mtk.Yellow, mtk.Green, 50), mtk.Green];
			mtk.PurpleLightToDark_3 = [mtk.Purple1, mtk.Purple2, mtk.Purple3];
			var nc = mtk.Navy;
			mtk.NavyDarkToLight_3 = [
				mix(nc, 'white', 0), mix(nc, 'white', 50), mix(nc, 'white', 80)
			];
			mtk.NavyDarkToLight_4 = [
				mix(nc, 'white', 0), mix(nc, 'white', 15), mix(nc, 'white', 25), mix(nc, 'white', 45)
			];
			mtk.graduated = {
				blueGreen : function (n) {
					return graduate(mtk.SecondaryBlue, mtk.Green, n);
				},
				secondaryBlue: function(n) {
					return graduate(mtk.SecondaryBlue, mtk.Navy, n);
				}
			};

			mtk.chartColourSet_Expenses = [
				mtk.Red,
				lighten(mtk.Red, 15),
				lighten(mtk.Red, 25),
				mtk.Orange,
				lighten(mtk.Orange, 15),
				lighten(mtk.Orange, 25),
				mtk.Gold,
				lighten(mtk.Gold, 15),
				lighten(mtk.Gold, 25),
				mtk.Yellow,
				lighten(mtk.Yellow, 15),
				lighten(mtk.Yellow, 25)

			];

			mtk.chartColourSet_Income = [
				mtk.Green,
				lighten(mtk.Green, 8),
				lighten(mtk.Green, 16),
				lighten(mtk.Green, 24),
				lighten(mtk.Green, 32),
				lighten(mtk.Green, 40)

			];

			return mtk;
		}

		function graduate(col1, col2,  n) {
			var d = Math.floor(100/n);
			var arr = [];
			for (var i = 0; i < n; i++) {
				arr.push(mix(col1, col2, i*d));
			}
			return arr;
		}
	}
})();
