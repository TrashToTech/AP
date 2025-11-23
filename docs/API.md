### 발표 대본 생성(”/generate-script”)

- Web → AI

```c
request = {
		"pdfId" : long,
		"pdfName" : str
}
```

- AI → Web

```c
response = {
		"pdfId" : long,
		"pdfInfo" : {
			"pageNum" : int,
			"script" : str
		}
}
```

### Text to Speech(”/speech”)

- Web → AI

```c
request = {
	"pdfId" : long,
	"pdfInfo" : {
			"pageNum" : int,
			"script" : str
		}
}
```

- AI → Web

```c
response = {
	"pdfId" : long,
	"audio" : {
			"pageNum" : int,
			"name" : str
		}
}
```