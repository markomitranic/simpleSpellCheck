<?php
error_reporting(0);
function get_dictionary($file) {

	$dict = file_get_contents($file);
	$dict = str_replace("\r", '', $dict);
	$dict = explode("\n", $dict);
	$dict = array_map('strtolower', $dict);
	return $dict;

}

function prepare_text_to_check($text){
	$text = preg_split("/([^a-z']+)/i", $text);
	$text = preg_replace("/^'|'$/", '', $text);
	return $text;

}

function check_in_dict($words, $dict, $original) {
	$counter = 0;
	$words_longer_than_three = 0;
	foreach ($words as $word) {
		if (strlen($word) > 3) { $words_longer_than_three++; }
		if (!in_array(strtolower($word), $dict) && strlen($word) > 3){
			$counter++;
			$wrong_words[] = $word;
			$original = str_replace($word, '<span style="text-decoration: underline;-moz-text-decoration-color: red;
    text-decoration-color: red;">' . $word . '</span>', $original);
		}
	}

	return [
		//'counter' => $counter,
		'wrong_words' => $wrong_words, //ne treba nam
		// 'words_count' => $words_longer_than_three, // ukupan broj reci duzih od 3 karaktera
		'all_words_count' => count($words), // ukupan broj reci
		// 'allow_to_submit' => ($counter) ? false : true,
		// 'corrected_text' => $original //ako zelimo da podvlacimo reci
	];
}

$dict = get_dictionary('en.dic');

$to_test = prepare_text_to_check($_POST['article_text']);

$out = check_in_dict($to_test, $dict, $_POST['article_text']);


echo json_encode($out);


