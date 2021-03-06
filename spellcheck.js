jQuery(document).ready(function(){
	try {
		spellInit('#mceu_25', 20);	
	} catch (e) {
		console.log(e);
	}
	
});


function spellInit(selector, thresholdPercent) {
	var editorElement = tinyMCE.activeEditor.iframeElement;
	var submit = $('button[type=submit]');
	appendSpellWarning(selector);
	var threshold = thresholdPercent;
	var isTimeouting = false;

	$(editorElement).contents().on('keydown', function() {
		if (isTimeouting === false) {
		startTimeout(1000);
		var content = tinyMCE.activeEditor.getContent({ format: 'text' });
			jQuery.ajax({
				type: 'POST',
				url: 'https://app.engsocial.com/spellchecker.php',
					data: {
						'article_text': content
					},
					success: function(data){
						var response = data;
						var response = JSON.parse(data);
						var currentErrorPercent = calcPercent(response);
						var isSubmitAllowed = checkResult(currentErrorPercent);
						// Decide if should allow submit
						if(isSubmitAllowed) {
							submit.removeAttr('disabled');
						} else {
							submit.attr('disabled', 'disabled');
						}	
						// Write out the errors
						$(selector).next().html(changeSpellWarning(isSubmitAllowed, currentErrorPercent, response.wrong_words));
					}
			});
		}
	});

	function startTimeout(miliseconds) {
		isTimeouting = true;
		setTimeout(function() {
			isTimeouting = false;
		}, miliseconds);
	}

	function appendSpellWarning(selector) {
		var element = jQuery('<div>', {
			'text': "There are no errors, you may post.",
			'class': "spellWarning"
		}).insertAfter(selector);
	}

	function changeSpellWarning(isSubmitAllowed, currentErrorPercent, wrongWords) {
		if (isSubmitAllowed) {
			var newText = "There are no errors, you may post.";
		} else {
			var newText = "Current error rate is " + currentErrorPercent + "% (limit: " + threshold + "%)<br>Errors: " + wrongWords;
		}
		return newText;
	}

	function calcPercent(response) {
		if (response.wrong_words !== null) {
		var result = 100 * (response.wrong_words.length / response.all_words_count);
		} else {
		var result = 0;
		}
		return Math.floor(result);
	}

	function checkResult(result) {
		if (result > threshold) {
			return false;
		} else {
			return true;
		}
	}
}