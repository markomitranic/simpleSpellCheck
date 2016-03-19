jQuery(document).ready(function(){
	spellInit('textarea', 20);


	var button = jQuery('.mentions div').closest('button');
	spellInit('.mentions div', 20, button);



});


function spellInit(selector, thresholdPercent, button) {
	appendSpellWarning(selector);
	var threshold = thresholdPercent;
	var isTimeouting = false;
	var customButton = button || false;

	jQuery(document).on('keydown', selector, function(){
		if (isTimeouting === false) {
		startTimeout(2000);
		var that = this;
		var $this = $(this);
		if (customButton === false) {
			var $submit = $this.closest('form').find('input[type="submit"]');
		} else {
			var $submit = button;
		}
		var content = $this.val();
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