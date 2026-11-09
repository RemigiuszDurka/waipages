# LaTeX i dokumenty naukowe

LaTeX jest jednym z podstawowych narzędzi do przygotowywania tekstów naukowych, szczególnie tam, gdzie pojawiają się wzory matematyczne, odwołania, bibliografia, tabele i duże dokumenty.

Wszystko to jest realizowane przez tekstowy plik źródłowy, który następnie kompilowany jest do postaci PDF.

---

# TeX i LaTeX

## Co to właściwie jest?

**TeX** jest systemem składu tekstu stworzonym przez Donalda Knutha.

Na początku był chaos: Potem pojawił się **TeX**. W 1977 r. Donald Knuth, zirytowany wynikiem składu jego pracy, rozpoczął tworzenie systemu składu tekstów matematycznych. Program ukazał się w 1982 r. Następnie powstał **LaTeX** (Leslie Lamport) jako zestaw makr upraszczających przygotowanie składu w TeX-u.

**Link do manuala zawierającego podstawy LaTeX-a!**: [Wprowadzenie do LaTeX-a](https://tug.ctan.org/info/lshort/polish/lshort-pl.pdf) Jeśli ktoś planuje karierę naukową, powinien przeczytać ten dokument!

**LaTeX** jest zestawem makr i konwencji zbudowanych na TeX-u, który znacznie upraszcza przygotowywanie dokumentów.

W praktyce użytkownik najczęściej pisze plik:

~~~text
dokument.tex
~~~

a następnie kompiluje go do:

~~~text
dokument.pdf
~~~

Najważniejsza idea jest podobna do pracy z kodem:

~~~text
źródło (plik tekstowy *.tex)
   ↓
kompilator
   ↓
wynik (plik *.pdf)
~~~

Nie ustawiamy ręcznie każdej czcionki, numerowania równań czy odstępu. Opisujemy **strukturę dokumentu**, a LaTeX zajmuje się składem.

---

# Minimalny dokument

Najmniejszy użyteczny dokument może wyglądać tak:

~~~latex
\documentclass{article}

\begin{document}

Hello, LaTeX!

\end{document}
~~~

Po kompilacji otrzymujemy PDF zawierający tekst:

> Hello, LaTeX!

---

## Preambuła i treść dokumentu

Dokument LaTeX ma dwie główne części.

### Preambuła

Wszystko przed:

~~~latex
\begin{document}
~~~

to **preambuła**.

Tutaj ustawiamy m.in.:

- klasę dokumentu,
- pakiety,
- język,
- kodowanie,
- marginesy,
- własne komendy.

### Treść

Wszystko pomiędzy:

~~~latex
\begin{document}
...
\end{document}
~~~

jest właściwą treścią dokumentu.

---

# Klasa dokumentu

Pierwsza linia często wygląda tak:

~~~latex
\documentclass{article}
~~~

Klasa określa ogólny typ dokumentu.

Popularne klasy:

| Klasa | Typ dokumentu |
| --- | --- |
| `article` | artykuł, raport, krótszy tekst |
| `report` | dłuższy raport |
| `book` | książka |
| `beamer` | prezentacja |

Klasa może przyjmować **opcje**, które zmieniają wygląd lub układ dokumentu. Wpisuje się je w nawiasach kwadratowych, przed nazwą klasy, oddzielając przecinkami:

~~~latex
\documentclass[12pt,a4paper,twocolumn]{article}
~~~

W tym przykładzie:

- `12pt` ustawia podstawowy rozmiar pisma na 12 punktów. Typowe wartości to `10pt`, `11pt` i `12pt`; domyślnie wiele klas używa `10pt`.
- `a4paper` wybiera format papieru A4. Inne spotykane opcje to `letterpaper` (format popularny w USA) i `legalpaper`.
- `twocolumn` składa tekst w dwóch kolumnach. Bez tej opcji dokument jest jednokolumnowy.

Opcje zależą od klasy — nie każda klasa obsługuje wszystkie z nich. Niektóre zmieniają układ strony (np. `twoside` dla składu dwustronnego), a inne zachowanie dokumentu (np. `draft`, tryb roboczy). Jeśli LaTeX zgłasza, że opcja jest nieznana lub nieobsługiwana, sprawdź dokumentację wybranej klasy.

---

# Pakiety

Pakiety rozszerzają możliwości LaTeX-a.

Przykład:

~~~latex
\usepackage{amsmath}
\usepackage{graphicx}
~~~

Pakiet `amsmath` daje rozbudowane narzędzia matematyczne.

Pakiet `graphicx` pozwala umieszczać grafiki.

Współczesne instalacje LaTeX-a zawierają bardzo dużą liczbę pakietów. Nie trzeba znać ich wszystkich. Ważniejsze jest nauczenie się wyszukiwania odpowiedniego pakietu do konkretnego zadania.

---

# Sekcje

Źródło:

~~~latex
\section{Wprowadzenie}

Tekst wprowadzenia.

\subsection{Cel}

Opis celu.

\subsection{Metoda}

Opis metody.
~~~

Efekt w PDF będzie miał strukturę:

> **1 Wprowadzenie**
>
> Tekst wprowadzenia.
>
> **1.1 Cel**
>
> Opis celu.
>
> **1.2 Metoda**
>
> Opis metody.

Numeracja jest generowana automatycznie.

---

# Polska składnia i kodowanie

W dokumentach w języku polskim warto ustawić odpowiednie kodowanie i język. Najczęściej używa się pakietów `inputenc` i `babel`:

~~~latex
\usepackage[utf8]{inputenc}
\usepackage[polish]{babel}
~~~

Pakiet `inputenc` ustawia kodowanie pliku źródłowego (UTF-8 jest obecnie standardem), a `babel` dostosowuje składnię i reguły typograficzne do języka polskiego. Pozwala to na poprawne łamanie wyrazów, użycie polskich znaków i odpowiednie formatowanie dat oraz numerów stron. Tak samo przetłumaczone zostają elementy interfejsu generowanego przez LaTeX, np. nazwy spisów treści czy list rysunków. 

~~~latex
\documentclass[12pt,a4paper]{article}  % klasa dokumentu i ustawienia strony
\usepackage[utf8]{inputenc}  % kodowanie pliku źródłowego
\usepackage[polish]{babel}  % język dokumentu

\title{Krótki raport}  % tytuł dokumentu
\author{Jan Kowalski}  % autor dokumentu
\date{\today}  % data utworzenia dokumentu

\begin{document}

\maketitle  % generuje blok tytułowy

\tableofcontents % generuje spis treści

\section{Wprowadzenie}  % sekcja wprowadzająca

Przykład z dużą ilością polskich znaków: ąćęłńóśźż.  % polskie znaki

Dawniej trzeba było pisać: Wroc\l{}aw  % zapis bez UTF-8

Teraz, dzięki ustawieniu kodowania UTF-8, można pisać bezpośrednio: Wrocław.  % zapis z UTF-8   

\end{document}  % koniec dokumentu
~~~

Zwróć uwagę na komentarze w kodzie LaTeX. Komentarze zaczynają się od znaku `%` i nie są wyświetlane w PDF. Pomagają one w dokumentowaniu kodu źródłowego.

---

# Formatowanie tekstu

Źródło:

~~~latex
\textbf{tekst pogrubiony}

\textit{tekst pochylony}

\emph{ważny fragment}
~~~

Efekt:

- **tekst pogrubiony**,
- *tekst pochylony*,
- wyróżniony fragment zależny od kontekstu.

W LaTeX-u zwykle lepiej opisywać **znaczenie** tekstu niż ręcznie ustawiać wygląd każdego fragmentu.

---

# Listy

## Lista punktowana

~~~latex
\begin{itemize}
    \item Python
    \item NumPy
    \item SymPy
\end{itemize}
~~~

Efekt:

- Python
- NumPy
- SymPy

## Lista numerowana

~~~latex
\begin{enumerate}
    \item Wczytaj dane.
    \item Wykonaj obliczenia.
    \item Zapisz wynik.
\end{enumerate}
~~~

Efekt:

1. Wczytaj dane.
2. Wykonaj obliczenia.
3. Zapisz wynik.

---

# Matematyka

Jednym z największych atutów LaTeX-a jest skład wzorów.

## Matematyka w tekście

Źródło:

~~~latex
Energia dana jest wzorem $E=mc^2$.
~~~

Efekt:

Energia dana jest wzorem $E=mc^2$.

---

## Osobny wzór

Źródło:

~~~latex
$$
E = mc^2
$$
~~~

W PDF otrzymamy wyśrodkowany wzór:

$$
E=mc^2
$$

W samych plikach Markdown tego kursu stosujemy reguły opisane w `hints.md`. W źródle LaTeX dokumentu można używać normalnej składni LaTeX-a.

Pamiętaj, że stosowany jest też drugi sposób (znany z problemów w markdown), czyli używanie znaków `\[` i `\]` do wyodrębnienia wzorów.

~~~latex
\[
E = mc^2
\]
~~~

Stosuj dolary `$$` do wyodrębnienia wzorów w trybie wyśrodkowanym by uniknąć problemów przy konwersji do różnych rozszerzeń plików.

---

## Numerowane równanie

Źródło:

~~~latex
\begin{equation}
    E = mc^2
\end{equation}
~~~

LaTeX automatycznie nada równaniu numer.

---

# Odwołania do równań

Ręczne wpisywanie „równanie (3)” jest ryzykowne. Po dodaniu wcześniejszego równania numer może się zmienić.

LaTeX rozwiązuje ten problem przez `label` i `ref`.

Źródło:

~~~latex
\begin{equation}
    E = mc^2
    \label{eq:energy}
\end{equation}

Korzystamy z równania~\ref{eq:energy}.
~~~

LaTeX sam wstawi aktualny numer równania.

Dobra praktyka to używanie czytelnych prefiksów:

~~~text
eq:     równanie
fig:    grafika
tab:    tabela
sec:    sekcja
~~~

Przykłady:

~~~text
eq:energy
fig:fit
tab:results
sec:method
~~~

---

# Kilka równań

Źródło:

~~~latex
\begin{align}
    x + y &= 5, \\
    x - y &= 1.
\end{align}
~~~

W PDF otrzymamy dwa wyrównane równania.

W praktyce środowisko `align` jest bardzo wygodne przy dłuższych rachunkach.

---

# Macierze

Źródło:

~~~latex
$$
A=
\begin{pmatrix}
2 & 1 \\
1 & 3
\end{pmatrix}
$$
~~~

Efekt:

$$
A=
\begin{pmatrix}
2 & 1 \\
1 & 3 \\
\end{pmatrix}
$$

---

# Tabela

Źródło:

~~~latex
\begin{table}[h]
    \centering

    \begin{tabular}{c c}
        \hline
        x & y \\
        \hline
        1 & 1 \\
        2 & 4 \\
        3 & 9 \\
        \hline
    \end{tabular}

    \caption{Przykładowe dane.}
    \label{tab:data}
\end{table}
~~~

LaTeX potrafi automatycznie numerować tabelę.

W tekście możemy napisać:

~~~latex
Dane przedstawiono w tabeli~\ref{tab:data}.
~~~

---



# Alfabet grecki w LaTeX-u

W matematyce i fizyce bardzo często wykorzystujemy litery greckie. W LaTeX-u zapisujemy je za pomocą komend rozpoczynających się od znaku `\`, po którym następuje nazwa litery.

## Pełny alfabet — małe i wielkie litery

| Litera | Mała | Kod LaTeX | Wielka | Kod LaTeX |
|---|---|---|---|---|
| Alfa | α | `\alpha` | Α | `A` |
| Beta | β | `\beta` | Β | `B` |
| Gamma | γ | `\gamma` | Γ | `\Gamma` |
| Delta | δ | `\delta` | Δ | `\Delta` |
| Epsilon | ε | `\varepsilon` | Ε | `E` |
| Dzeta | ζ | `\zeta` | Ζ | `Z` |
| Eta | η | `\eta` | Η | `H` |
| Theta | θ | `\theta` | Θ | `\Theta` |
| Jota | ι | `\iota` | Ι | `I` |
| Kappa | κ | `\kappa` | Κ | `K` |
| Lambda | λ | `\lambda` | Λ | `\Lambda` |
| Mi | μ | `\mu` | Μ | `M` |
| Ni | ν | `\nu` | Ν | `N` |
| Ksi | ξ | `\xi` | Ξ | `\Xi` |
| Omikron | ο | `o` | Ο | `O` |
| Pi | π | `\pi` | Π | `\Pi` |
| Rho | ρ | `\rho` | Ρ | `P` |
| Sigma | σ | `\sigma` | Σ | `\Sigma` |
| Tau | τ | `\tau` | Τ | `T` |
| Ypsilon | υ | `\upsilon` | Υ | `\Upsilon` |
| Fi | φ | `\varphi` | Φ | `\Phi` |
| Chi | χ | `\chi` | Χ | `X` |
| Psi | ψ | `\psi` | Ψ | `\Psi` |
| Omega | ω | `\omega` | Ω | `\Omega` |

**Uwaga:** nie wszystkie wielkie litery greckie mają osobne komendy. Jeśli wyglądają identycznie jak litery łacińskie, zapisujemy je zwykłymi literami, np. `A`, `B`, `E`, `M` czy `N`. W standardowym LaTeX-u nie ma również komendy `\omicron` — używamy `o`.

## Alternatywne warianty liter

Niektóre litery mają więcej niż jeden wariant typograficzny:

| Wariant pierwszy | Wariant drugi | Wygląd w matematyce | Wygląd w matematyce |
|---|---|---|---|
|---|---|
| `\epsilon` | `\varepsilon` | $\epsilon$ | $\varepsilon$ |
| `\theta` | `\vartheta` | $\theta$ | $\vartheta$ |
| `\kappa` | `\varkappa` | $\kappa$ | $\varkappa$ |
| `\pi` | `\varpi` | $\pi$ | $\varpi$ |
| `\rho` | `\varrho` | $\rho$ | $\varrho$ |
| `\sigma` | `\varsigma` | $\sigma$ | $\varsigma$ |
| `\phi` | `\varphi` | $\phi$ | $\varphi$ |

Wygląd poszczególnych wariantów zależy również od użytej czcionki matematycznej. Do `\varkappa` dołącz pakiet `amssymb`.

## Przykłady zastosowania

```latex
$$
\alpha+\beta=\gamma,
\qquad
\Delta x=x_2-x_1
$$

$$
\Sigma=\sum_{i=1}^{n}x_i,
\qquad
\Phi=\int_0^T V(t)\,\mathrm{d}t
$$

$$
\omega=2\pi f,
\qquad
\lambda=\frac{c}{f}
$$
```

do daje:

$$
\alpha+\beta=\gamma,
\qquad
\Delta x=x_2-x_1
$$

$$
\Sigma=\sum_{i=1}^{n}x_i,
\qquad
\Phi=\int_0^T V(t)\,\mathrm{d}t
$$

$$
\omega=2\pi f,
\qquad
\lambda=\frac{c}{f}
$$

Zwróć uwagę na różnicę między `\Sigma` (wielka litera sigma) a `\sum` (operator sumowania).

---

# Funkcje matematyczne w LaTeX-u

W zapisie matematycznym **nazwy funkcji powinny być składane prostą czcionką**, a zmienne najczęściej kursywą.

Dlatego zamiast pisać `sin(x)` należy użyć `\sin(x)`. W pierwszym przypadku LaTeX interpretuje litery jako trzy osobne zmienne, a w drugim jako nazwę funkcji.

## Funkcje trygonometryczne

| Funkcja | Polecenie |
|---|---|
| Sinus | `\sin` |
| Cosinus | `\cos` |
| Tangens | `\tan` |
| Cotangens | `\cot` |
| Secans | `\sec` |
| Cosecans | `\csc` |
| Arcus sinus | `\arcsin` |
| Arcus cosinus | `\arccos` |
| Arcus tangens | `\arctan` |

## Logarytmy i funkcje wykładnicze

| Funkcja | Polecenie |
|---|---|
| Logarytm naturalny | `\ln` |
| Logarytm | `\log` |
| Logarytm dziesiętny | `\lg` |
| Funkcja wykładnicza | `\exp` |


Przykłady obu logarytmów i funkcji trygonometrycznych:

$$
\sin^2 x+\cos^2 x=1
$$

$$
\tan x=\frac{\sin x}{\cos x}
$$

$$
\arcsin\left(\frac{1}{2}\right)
=\frac{\pi}{6}
$$

$$
\ln(e^x)=x
$$

$$
\log_2 8=3
$$

$$
\exp(-x^2)=e^{-x^2}
$$


## Inne funkcje i operatory

| Funkcja / operator | Polecenie | Wygląd |
|---|---|---|
| Minimum | `\min` | $\min$ |
| Maksimum | `\max` | $\max$ |
| Supremum | `\sup` | $\sup$ |
| Infimum | `\inf` | $\inf$ |
| Granica | `\lim` | $\lim$ |
| Granica górna | `\limsup` | $\limsup$ |
| Granica dolna | `\liminf` | $\liminf$ |
| Wyznacznik | `\det` | $\det$ |
| Wymiar | `\dim` | $\dim$ |
| Jądro odwzorowania | `\ker` | $\ker$ |
| Największy wspólny dzielnik | `\gcd` | $\gcd$ |
| Argument liczby zespolonej | `\arg` | $\arg$ |
| Prawdopodobieństwo | `\Pr` | $\Pr$ |


## Definiowanie własnych operatorów

Jeżeli danej funkcji nie ma na liście standardowych poleceń, możemy użyć `\operatorname` z pakietu `amsmath`.

```latex

\usepackage{amsmath}

$$
\operatorname{Tr}(A)
=\sum_{i=1}^{n} A_{ii}
$$

$$
\operatorname{rank}(A)
=\dim(\operatorname{Im} A)
$$

$$
\operatorname{Var}(X)
=\mathbb{E}\left[(X-\mathbb{E}[X])^2\right]
$$
```

Jeżeli dany operator pojawia się wielokrotnie, wygodniej zdefiniować go w preambule:

```latex
\DeclareMathOperator{\Tr}{Tr}
\DeclareMathOperator{\rank}{rank}
```

---

# Sumy, całki, granice i pochodne

LaTeX udostępnia rozbudowane operatory matematyczne, w których można umieszczać indeksy dolne, górne i dodatkowe symbole.

## Sumowanie i iloczyny

| Operator | Kod | Wygląd |
|---|---|---|
| Suma | `\sum` | $\sum$ |
| Iloczyn | `\prod` | $\prod$ |
| Suma zbiorów | `\bigcup` | $\bigcup$ |
| Część wspólna zbiorów | `\bigcap` | $\bigcap$ |
| Suma prosta | `\bigoplus` | $\bigoplus$ |

## Całki

| Operator | Kod | Wygląd |
|---|---|---|
| Całka pojedyncza | `\int` | $\int$ |
| Całka podwójna | `\iint` | $\iint$ |
| Całka potrójna | `\iiint` | $\iiint$ |
| Całka po krzywej zamkniętej | `\oint` | $\oint$ |

Zapis `\mathrm{d}` służy do uzyskania prostej litery d, a `\,` wprowadza niewielki odstęp.

## Pochodne zwyczajne i cząstkowe

$$
\frac{\mathrm{d}f}{\mathrm{d}x}
$$

$$
\frac{\mathrm{d}^2f}{\mathrm{d}x^2}
$$

$$
\frac{\partial f}{\partial x}
$$

$$
\frac{\partial^2 f}
{\partial x\,\partial y}
$$

Możemy również stosować oznaczenia z kropką i primem:

$$
\dot{x},\qquad
\ddot{x},\qquad
f'(x),\qquad
f''(x)
$$

## Granice

Użycie:

```latex
$$
\lim_{n\to\infty}
\left(1+\frac1n\right)^n=e
$$

$$
\lim_{x\to 0}
\frac{e^x-1}{x}=1
$$

$$
\limsup_{n\to\infty}a_n,
\qquad
\liminf_{n\to\infty}a_n
$$
```

Daje 

$$
\lim_{n\to\infty}
\left(1+\frac1n\right)^n=e
$$

$$
\lim_{x\to 0}
\frac{e^x-1}{x}=1
$$

$$
\limsup_{n\to\infty}a_n,
\qquad
\liminf_{n\to\infty}a_n
$$


---

# Przydatne konstrukcje i symbole matematyczne

## Indeksy, ułamki i pierwiastki

| Konstrukcja | Polecenie | Wygląd |
|---|---|---|
| Indeks dolny | `x_i` | $x_i$ |
| Indeks górny | `x^2` | $x^2$ |
| Oba indeksy | `x_i^{n+1}` | $x_i^{n+1}$ |
| Ułamek | `\frac{a}{b}` | $\frac{a}{b}$ |
| Pierwiastek | `\sqrt{x}` | $\sqrt{x}$ |
| Pierwiastek stopnia n | `\sqrt[n]{x}` | $\sqrt[n]{x}$ |
| Wektor | `\vec{v}` | $\vec{v}$ |
| Litera z daszkiem | `\hat{H}` | $\hat{H}$ |
| Litera z kreską | `\bar{x}` | $\bar{x}$ |

```latex
$$
x_i^{n+1}
=\frac{\sqrt{x_i^2+1}}{n+1}
$$

$$
\hat{H}\psi=E\psi
$$
```

## Nawiasy automatycznie dopasowane do wzoru

```latex
$$
\left(\frac{a+b}{c+d}\right)^2
$$

$$
\left[
\frac{x^2+1}{x-1}
\right]
$$
```

Polecenia `\left` i `\right` dobierają rozmiar nawiasów do zawartości.

## Funkcje przedziałowe i układy równań

Środowisko `cases` pozwala umieścić kilka definicji pod wspólną klamrą:

```latex
$$
f(x)=
\begin{cases}
x^2, & x\geq 0,\\
-x, & x<0.
\end{cases}
$$
```
$$
f(x)=
\begin{cases}
x^2, & x\geq 0,\\
-x, & x<0.
\end{cases}
$$

## Strzałki i relacje

| Symbol | Kod |
|---|---|
| → | `\to` |
| ← | `\leftarrow` |
| ↔ | `\leftrightarrow` |
| ⇒ | `\Rightarrow` |
| ⇔ | `\Leftrightarrow` |
| ≠ | `\neq` |
| ≈ | `\approx` |
| ≡ | `\equiv` |
| ≤ | `\leq` |
| ≥ | `\geq` |
| ∈ | `\in` |
| ∉ | `\notin` |
| ∀ | `\forall` |
| ∃ | `\exists` |
| ∞ | `\infty` |
| ∇ | `\nabla` |
| ∂ | `\partial` |
| ℏ | `\hbar` |
| ∝ | `\propto` |

## Oznaczanie fragmentów wzoru

```latex
$$
\underbrace{
x_1+x_2+\cdots+x_n
}_{n\text{ składników}}
$$
```

$$
\underbrace{
x_1+x_2+\cdots+x_n
}_{n\text{ składników}}
$$

```latex
$$
\overbrace{a+b+c}^{S}
$$
```

$$
\overbrace{a+b+c}^{S}
$$

## Przykład z fizyki — kilka elementów w jednym wzorze

```latex
$$
\boxed{
G_{\mu\nu}+\Lambda g_{\mu\nu}
=\frac{8\pi G}{c^4}T_{\mu\nu}
}
$$
```

$$
\boxed{
G_{\mu\nu}+\Lambda g_{\mu\nu}
=\frac{8\pi G}{c^4}T_{\mu\nu}
}
$$

W tym przykładzie wykorzystano:

- `\boxed{...}` — ramkę wokół równania,
- `\mu`, `\nu`, `\Lambda`, `\pi` — litery greckie,
- `_` — indeksy dolne,
- `^` — indeks górny,
- `\frac` — ułamek.

**Pakiety wymagane do przykładów:** większość zaawansowanych konstrukcji działa po dodaniu w preambule:

```latex
\usepackage{amsmath,amssymb}
```

Wszystkie prezentowane wzory można wykorzystać bezpośrednio w dokumentach LaTeX, a większość także w Markdownie obsługującym matematykę.

---

# Grafika

Do wstawiania grafik zwykle używamy pakietu:

~~~latex
\usepackage{graphicx}
~~~

Przykład:

~~~latex
\begin{figure}[h]
    \centering

    \includegraphics[
        width=0.7\textwidth
    ]{fit.png}

    \caption{Dane i dopasowana prosta.}
    \label{fig:fit}
\end{figure}
~~~

Odwołanie:

~~~latex
Wynik pokazano na rysunku~\ref{fig:fit}.
~~~

---

## PNG, JPG czy PDF?

W dokumentach naukowych warto rozróżniać grafikę rastrową i wektorową.

| Format | Typ | Typowe zastosowanie |
| --- | --- | --- |
| PNG | rastrowy | wykres, zrzut ekranu, grafika bez strat |
| JPG | rastrowy | zdjęcia |
| PDF | często wektorowy | wykresy i diagramy |
| SVG | wektorowy | grafika WWW, diagramy |

Dla wykresu naukowego grafika wektorowa jest zwykle bardzo wygodna, ponieważ zachowuje ostrość przy powiększaniu.

Matplotlib może zapisać ten sam wykres jako PDF. W kompilowanym pliku texowym można potem osadzić inny plik PDF (ten z wykresem) poprzez użycie `\include{inny_plik.pdf}`. Daje to też możliwość łączenia róznych pdfów razem. Podobnie używamy `\input{plik.tex}` do wstawienia zawartości innego pliku LaTeX wewnątrz naszego.

W przypadku obrazków i screenów staraj się używać plików `obrazek.PNG` używając kommendy `\includegraphics{obrazek.PNG}`. Nie zapomnij w preambule o pakiecie `graphicx`:

~~~latex
\usepackage{graphicx}

\begin{document}

\includegraphics{obrazek.PNG}

\end{document}
~~~

---

# Kompilacja

Plik `plik.tex` jest zwykłym plikiem tekstowym, więc możesz go napisać nawet w Notatniku. Aby jednak zamienić go na PDF, potrzebujesz **kompilatora** (programu, który przetwarza kod LaTeX-a na dokument) oraz — dla wygody — **edytora**, który pozwala kompilować jednym kliknięciem i od razu pokazuje podgląd PDF-a.

Do dyspozycji masz trzy drogi:

1. **Overleaf (online)** — nic nie instalujesz, wszystko działa w przeglądarce. **To środowisko będzie preferowane na zajęciach** (opisane w osobnym rozdziale poniżej).
2. **Lokalna instalacja** — dystrybucja LaTeX-a (kompilator + pakiety) i edytor na Twoim komputerze. Działa bez internetu.
3. **VS Code** — edytor, który możesz połączyć z lokalną dystrybucją LaTeX-a.

## Lokalna instalacja

Dystrybucja LaTeX-a zawiera kompilator (`pdflatex`, `xelatex`, `lualatex`, `bibtex`/`biber`) oraz tysiące pakietów. Jest duża (od kilkuset MB do kilku GB), więc instalacja może chwilę potrwać.

### Windows

- Dystrybucja: [MiKTeX](https://miktex.org/download) — instaluje tylko podstawę, a brakujące pakiety doinstalowuje automatycznie przy pierwszej kompilacji (warto zgodzić się na to w ustawieniach: *Install missing packages on-the-fly → Yes*). Alternatywa: [TeX Live](https://tug.org/texlive/windows.html) (pełna, duża instalacja).
- Edytor: [TeXstudio](https://www.texstudio.org/) — kompilacja i podgląd PDF-a po kliknięciu zielonej strzałki (lub klawiszem `F5`); dobrze podpowiada komendy i wskazuje błędy. Popularne alternatywy: [TeXworks](https://www.tug.org/texworks/) (instaluje się razem z MiKTeX-iem), [VS Code](#vs-code).

### Linux

Dystrybucję instalujemy z menedżera pakietów, np. w Ubuntu/Debianie:

~~~bash
sudo apt install texlive-full
~~~

`texlive-full` jest bardzo duży (kilka GB). Wersja lżejsza, zwykle wystarczająca:

~~~bash
sudo apt install texlive-latex-extra texlive-lang-polish texlive-fonts-recommended latexmk
~~~

W innych dystrybucjach szukaj pakietów `texlive` (Fedora: `sudo dnf install texlive-scheme-full`, Arch: `sudo pacman -S texlive`). Więcej: [TeX Live — instalacja](https://tug.org/texlive/).

Edytor: [TeXstudio](https://www.texstudio.org/) (`sudo apt install texstudio`), a także np. [Kile](https://kile.sourceforge.io/) lub [VS Code](#vs-code).

### macOS

(Uwaga: nazwa „iOS” dotyczy telefonów — na komputerach Apple system to macOS.)

- Dystrybucja: [MacTeX](https://www.tug.org/mactex/) (oparty na TeX Live) lub mniejszy BasicTeX; instalacja także przez Homebrew: `brew install --cask mactex`.
- Edytor: [TeXstudio](https://www.texstudio.org/), [TeXShop](https://pages.uoregon.edu/koch/texshop/) (dołączony do MacTeX-a) albo [VS Code](#vs-code).

### Sprawdzenie instalacji

W terminalu wpisz:

~~~bash
pdflatex --version
~~~

Jeżeli zobaczysz numer wersji, kompilator jest poprawnie zainstalowany i dostępny w ścieżce systemowej (po instalacji może być potrzebne ponowne uruchomienie terminala).

## VS Code

[Visual Studio Code](https://code.visualstudio.com/) też nadaje się do pracy z LaTeX-em. Potrzebujesz:

1. lokalnej dystrybucji LaTeX-a (patrz wyżej) oraz Perla (wymagany przez `latexmk`; na Windowsie np. [Strawberry Perl](https://strawberryperl.com/)),
2. rozszerzenia [LaTeX Workshop](https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop) (instalacja: `Ctrl+Shift+X`, wyszukaj *LaTeX Workshop*).

Po otwarciu pliku `.tex` kompilujesz przyciskiem *Build LaTeX project* (zielona strzałka na pasku bocznym *TeX*) lub skrótem `Ctrl+Alt+B`, a podgląd PDF-a otwierasz przez *View LaTeX PDF* (`Ctrl+Alt+V`). Kompilacja może też uruchamiać się automatycznie przy zapisie pliku.

## Overleaf

[Overleaf](https://www.overleaf.com) to edytor online z wbudowanym kompilatorem i podglądem PDF-a. Nie wymaga instalacji, dobrze nadaje się do pracy zespołowej i będzie używany na zajęciach — szczegóły w rozdziale **Overleaf** poniżej.


## `pdflatex` czyli kompilacja w terminalu

Jeżeli mamy lokalną instalację LaTeX-a:

~~~bash
pdflatex report.tex
~~~

powinien powstać:

~~~text
report.pdf
~~~

Przy odwołaniach numerowanych czasem trzeba wykonać kompilację więcej niż raz.

---

# Błędy kompilacji

LaTeX nie zawsze kompiluje się za pierwszym razem.

Typowe przyczyny:

- brak zamkniętej klamry,
- brak `\end{...}`,
- błędna nazwa pliku,
- brak grafiki,
- brak pakietu,
- znak specjalny użyty bez odpowiedniej składni.

Przykład błędu:

~~~latex
\textbf{ważny tekst
~~~

brakuje końcowej klamry:

~~~latex
\textbf{ważny tekst}
~~~

W komunikacie błędu warto szukać:

- numeru linii,
- nazwy pliku,
- pierwszego sensownego komunikatu błędu.

Jedna pomyłka może wygenerować wiele kolejnych komunikatów.

---

# Bibliografia

Ręczne numerowanie publikacji szybko staje się niewygodne.

Zamiast tego przechowujemy dane bibliograficzne osobno.

Przykład pliku:

~~~text
references.bib
~~~

---

# BibTeX

## Wpis bibliograficzny

Przykład:

~~~bibtex
@article{einstein1905,
    author  = {Albert Einstein},
    title   = {Zur Elektrodynamik bewegter Koerper},
    journal = {Annalen der Physik},
    year    = {1905},
    volume  = {322},
    pages   = {891--921}
}
~~~

Najważniejszy element to klucz:

~~~text
einstein1905
~~~

Tego klucza używamy później w dokumencie.

---

## Cytowanie

Źródło:

~~~latex
Szczególna teoria względności została
sformułowana przez Einsteina~\cite{einstein1905}.
~~~

Na końcu dokumentu możemy umieścić:

~~~latex
\bibliographystyle{plain}
\bibliography{references}
~~~

LaTeX i BibTeX zajmą się numeracją oraz formatowaniem bibliografii.

---

## Klasyczny workflow BibTeX

Dla dokumentu `report.tex`:

~~~bash
pdflatex report.tex
bibtex report
pdflatex report.tex
pdflatex report.tex
~~~

Można też użyć:

~~~bash
latexmk -pdf report.tex
~~~

jeśli konfiguracja projektu jest standardowa.

---

# DOI i dane bibliograficzne

Przy dodawaniu publikacji warto korzystać z trwałych identyfikatorów, np. DOI.

Przykład DOI ma postać:

~~~text
10.xxxx/...
~~~

Nie należy tworzyć wpisu bibliograficznego „z pamięci”, jeśli można pobrać poprawne dane od wydawcy, Crossref, INSPIRE, arXiv lub innego wiarygodnego źródła.

Najczęstsze problemy w bibliografii:

- błędny rok,
- zła kolejność autorów,
- literówki w tytule,
- brak numeru tomu,
- niepoprawny DOI.

---

# Overleaf

## Co to jest Overleaf?

**Overleaf** jest internetowym środowiskiem do pracy z LaTeX-em. Wchodzi się do niego przez przeglądarkę internetową, bez potrzeby instalowania czegokolwiek lokalnie. Po prostu otwieramy stronę [https://www.overleaf.com](https://www.overleaf.com) i zaczynamy pracę.

Lewy panel zawiera listę plików projektu oraz strukturę katalogów. Środkowy panel to edytor źródła, a prawy panel pokazuje wynikowy PDF.

- [Overleaf — Learn LaTeX in 30 minutes](https://www.overleaf.com/learn/latex/Learn_LaTeX_in_30_minutes)

Typowy widok zawiera:

- pliki projektu,
- edytor źródła,
- wynikowy PDF,
- log kompilacji.

Największa zaleta: do rozpoczęcia pracy nie trzeba lokalnie instalować pełnego środowiska LaTeX.

---

## Projekt Overleaf

Projekt może wyglądać:

~~~text
report.tex
references.bib
fit.pdf
~~~

Po kompilacji Overleaf pokazuje wynikowy PDF.

---

## Współpraca

Kilka osób może pracować nad tym samym dokumentem.

To wygodne przy:

- artykułach,
- raportach,
- pracach dyplomowych,
- notatkach,
- prezentacjach.

Nadal jednak warto mieć jasną strukturę plików i sensownie nazywać grafiki.

Nazwy:

~~~text
fig1_final_new2.png
test123.pdf
aaa.tex
~~~

są znacznie mniej użyteczne niż:

~~~text
fit_linear.pdf
spectrum.pdf
introduction.tex
methods.tex
~~~

---

## Dobre materiały

- [Overleaf — Mathematical expressions](https://www.overleaf.com/learn/latex/Mathematical_expressions)
- [Overleaf — Bibliography management with BibTeX](https://www.overleaf.com/learn/latex/Bibliography_management_with_bibtex)

---

# Większy dokument

Przy dłuższym dokumencie nie trzeba trzymać wszystkiego w jednym pliku.

Przykład:

~~~text
thesis/
├── main.tex
├── references.bib
├── chapters/
│   ├── introduction.tex
│   ├── methods.tex
│   └── results.tex
└── figures/
    └── fit.pdf
~~~

W `main.tex` możemy użyć:

~~~latex
\input{chapters/introduction}
\input{chapters/methods}
\input{chapters/results}
~~~

Dzięki temu duży dokument jest łatwiejszy do utrzymania.

---

# Praca dyplomowa

Typowa praca dyplomowa zawiera m.in.:

- stronę tytułową,
- streszczenie,
- spis treści,
- wprowadzenie,
- rozdziały merytoryczne,
- podsumowanie,
- bibliografię,
- ewentualne dodatki.

LaTeX jest szczególnie wygodny, ponieważ automatycznie obsługuje:

- numerację rozdziałów,
- spis treści,
- odwołania,
- bibliografię,
- podpisy tabel i rysunków.

Nie trzeba ręcznie aktualizować numerów po każdej zmianie struktury.

---

# CV w LaTeX-u

CV również może być dokumentem LaTeX.

Zaletą jest:

- powtarzalny układ,
- łatwa wersjonowalność,
- możliwość przechowywania źródła w Git,
- łatwe generowanie nowych wersji.

Nie ma jednak obowiązku używania LaTeX-a do każdego dokumentu. Narzędzie powinno pasować do zadania.

---

# Beamer

## Prezentacja w LaTeX-u

Klasa `beamer` służy do tworzenia prezentacji.

Minimalny przykład:

~~~latex
\documentclass{beamer}

\title{Krótka prezentacja}
\author{Jan Kowalski}

\begin{document}

\begin{frame}
    \titlepage
\end{frame}

\begin{frame}{Wynik}

Najważniejszy wynik:

$$
E=mc^2
$$

\end{frame}

\end{document}
~~~

Każde środowisko `frame` odpowiada jednemu slajdowi.

---

## Lista na slajdzie

~~~latex
\begin{frame}{Plan}

\begin{itemize}
    \item problem,
    \item metoda,
    \item wynik,
    \item wniosek.
\end{itemize}

\end{frame}
~~~

Beamer jest szczególnie wygodny dla prezentacji z dużą liczbą wzorów.

---

# arXiv

## Co to jest arXiv?

**arXiv** jest repozytorium preprintów naukowych.

Autorzy udostępniają tam artykuły m.in. z:

- fizyki,
- matematyki,
- informatyki,
- statystyki,
- ekonomii.

arXiv nie zastępuje procesu recenzji czasopisma, ale pozwala szybko i publicznie udostępnić preprint.

---

## Źródła artykułu

Do przygotowania zgłoszenia potrzebne są zwykle źródła pozwalające odtworzyć PDF.

Typowy zestaw:

~~~text
main.tex
references.bib
figure1.pdf
figure2.pdf
~~~

W projekcie nie powinny znaleźć się przypadkowe:

- hasła,
- klucze API,
- prywatne komentarze,
- duże nieużywane pliki,
- dane, których nie wolno publikować.

---

## Sprawdzenie przed publikacją

Przed wysłaniem materiałów warto sprawdzić:

1. czy dokument kompiluje się od początku,
2. czy wszystkie grafiki istnieją,
3. czy bibliografia jest kompletna,
4. czy nie ma brakujących odwołań,
5. czy pliki źródłowe są wystarczające do odtworzenia PDF,
6. czy w projekcie nie ma materiałów prywatnych.

---

## Dobre materiały

- [arXiv — Help](https://info.arxiv.org/help/)
- [arXiv — Submit](https://info.arxiv.org/help/submit/)

---

# Mały kompletny raport

Połączmy najważniejsze elementy.

`report.tex`:

~~~latex
\documentclass{article}

\usepackage{amsmath}
\usepackage{graphicx}

\title{Analiza prostego modelu}
\author{Jan Kowalski}

\begin{document}

\maketitle

\section{Wprowadzenie}

Rozważamy model liniowy

\begin{equation}
    y=ax+b.
    \label{eq:model}
\end{equation}

\section{Wynik}

Parametry dopasowania wynoszą

\[
a=2.01143,
\qquad
b=1.03810.
\]

Wynik przedstawiono na
rysunku~\ref{fig:fit}.

\begin{figure}[h]
    \centering

    \includegraphics[
        width=0.7\textwidth
    ]{fit.pdf}

    \caption{Dane i dopasowana prosta.}
    \label{fig:fit}
\end{figure}

Model z równania~\ref{eq:model}
dobrze opisuje dane.

\end{document}
~~~

To już jest mały dokument naukowy z:

- strukturą,
- matematyką,
- numerowanym równaniem,
- grafiką,
- odwołaniami.

## Galerie szablonów

Ogólna galeria:

- [https://latextemplates.com/](https://latextemplates.com/)
- [https://www.overleaf.com/gallery](https://www.overleaf.com/gallery)

Prezentacje:

- [https://deic.uab.cat/~iblanes/beamer_gallery/](https://deic.uab.cat/~iblanes/beamer_gallery/)
- [https://latex-beamer.com/tutorials/beamer-themes/](https://latex-beamer.com/tutorials/beamer-themes/)
- [https://letx.app/templates/presentations/](https://letx.app/templates/presentations/)

CV:

- [https://www.overleaf.com/gallery/tagged/cv](https://www.overleaf.com/gallery/tagged/cv)
- [https://www.livecareer.pl/cv/latex-cv](https://www.livecareer.pl/cv/latex-cv)
- [https://latextemplates.com/cat/curricula-vitae/](https://latextemplates.com/cat/curricula-vitae/)

## Użyteczne narzędzia

- [Detexify](https://detexify.kirelabs.org/) — narzędzie do rozpoznawania symboli LaTeX na podstawie rysunku.
- [Overleaf](https://www.overleaf.com/) — popularna platforma do tworzenia dokumentów LaTeX online.
- [LaTeX Wikibook](https://en.wikibooks.org/wiki/LaTeX) — obszerne źródło wiedzy na temat LaTeX-a.
- [TeX Stack Exchange](https://tex.stackexchange.com/) — forum pytań i odpowiedzi dotyczących LaTeX-a.
- [LaTeX Project](https://www.latex-project.org/) — oficjalna strona projektu LaTeX, zawierająca dokumentację i informacje o pakietach.
- [CTAN](https://ctan.org/) — Comprehensive TeX Archive Network, zawierający pakiety i dokumentację LaTeX.
- [MikTeX](https://miktex.org/) — dystrybucja LaTeX-a dla systemu Windows, zawierająca menedżer pakietów i narzędzia do kompilacji dokumentów.
- [KaTeX](https://katex.org/) — biblioteka do renderowania wzorów matematycznych w przeglądarce internetowej.
- [TeX Live](https://www.tug.org/texlive/) — dystrybucja LaTeX-a dla systemów Unix/Linux, zawierająca kompletne środowisko do kompilacji dokumentów.
- [TeXstudio](https://www.texstudio.org/) — popularny edytor LaTeX, oferujący podświetlanie składni, autouzupełnianie i narzędzia do kompilacji dokumentów.
- [VS Code LaTeX Workshop](https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop) — rozszerzenie do Visual Studio Code umożliwiające pracę z dokumentami LaTeX.