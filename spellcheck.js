$(document).ready(function(){
	spellInit('textarea', 20);
});


function spellInit(selector, thresholdPercent) {
	appendSpellWarning(selector);
	var threshold = thresholdPercent;
	var isTimeouting = false;
	

	$(document).on('input propertychange', selector, function(){
		if (isTimeouting === false) {
		startTimeout(2000);
		var that = this;
		var $this = $(this);
		var $submit = $this.closest('form').find('input[type="submit"]');
		var content = $this.val();
			$.ajax({
				method: 'POST',
				url: 'spellchecker.php',
					data: {
						'article_text': content
					},
					success: function(data){
						var response = data;
						var response = JSON.parse(data);

						console.log(response.all_words_count);
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
		var element = $('<div>', {
			'text': "There are no errors, you may post.",
			'class': "spellWarning"
		}).insertAfter(selector);
		return element;
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