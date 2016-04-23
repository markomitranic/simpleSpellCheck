jQuery(document).ready(function(){
	$('body').css('background-color', 'red');
	spellInit('#mceu_25', 20);
// tinyMCE ID -->   mceu_25

});





function spellInit(selector, thresholdPercent) {
	appendSpellWarning(selector);
	var threshold = thresholdPercent;
	var isTimeouting = false;
	console.log('stigo sam doovde');

	$(document).on('keydown', function() {
		console.log('MARKO');
	});

	$(document).on('keydown', function() {
	if (isTimeouting === false) {
	startTimeout(2000);

	var content = selector.text();
	console.log(content);
		jQuery.ajax({
			method: 'POST',
			url: 'spellchecker.php',
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
						$submit.removeAttr('disabled');
					} else {
						$submit.attr('disabled', 'disabled');
					}	
					// Write out the errors
					$this.next().html(changeSpellWarning(isSubmitAllowed, currentErrorPercent, response.wrong_words));
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
	console.log('unutra sam zavrsio sve');

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
		var result = (100 / response.all_words_count) * response.wrong_words.length;
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