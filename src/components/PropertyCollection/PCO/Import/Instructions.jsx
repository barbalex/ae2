import React from 'react'
import styled from '@emotion/styled'
import Icon from '@mui/material/Icon'
import {
  MdDone as DoneIcon,
  MdError as ErrorIcon,
  MdInfoOutline as InfoOutlineIcon,
} from 'react-icons/md'

const StyledH3 = styled.h3`
  margin-left: 8px;
  margin-bottom: 10px;
`
const FirstTitle = styled(StyledH3)`
  padding-top: 10px;
`
const HowToImportContainer = styled.div`
  column-width: 500px;
  padding: 0 8px 0 8px;
  ul {
    padding-left: 20px;
  }
`
const StyledH4 = styled.h4`
  margin: 0;
`
const LiContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  break-inside: avoid;
`
const EmSpan = styled.span`
  background-color: #8d8c8c40;
  padding: 1px 3px;
  border-radius: 4px;
`
const InlineIcon = styled(Icon)`
  margin-left: 8px;
`
const InlineDiv = styled.div`
  margin-left: 8px;
  font-style: italic;
`
const StyledDoneIcon = styled(DoneIcon)`
  color: green !important;
`
const StyledErrorIcon = styled(ErrorIcon)`
  color: red !important;
`
const StyledInfoOutlineIcon = styled(InfoOutlineIcon)`
  color: orange !important;
`
const StyledP = styled.p`
  margin-top: -5px;
`
const StyledUl = styled.ul`
  ul {
    margin-top: 0;
  }
  li {
    margin-bottom: 0;
  }
  li:last-of-type {
    margin-bottom: 5px;
  }
`

const ImportPcoInstructions = ({
  idsExist,
  objectIdsAreReal,
  pCOfOriginIdsAreReal,
  existsPropertyKey,
  existsNoDataWithoutKey,
  idsAreUuids,
  idsAreUnique,
  objectIdsExist,
  objectIdsAreUuid,
  objectIdsAreRealNotTested,
  pCOfOriginIdsExist,
  pCOfOriginIdsAreUuid,
  pCOfOriginIdsAreRealNotTested,
  propertyKeysDontContainApostroph,
  propertyKeysDontContainBackslash,
  propertyValuesDontContainApostroph,
  propertyValuesDontContainBackslash,
}) => (
  <>
    <FirstTitle>Anforderungen an zu importierende Eigenschaften</FirstTitle>
    <HowToImportContainer>
      <StyledH4>Autorenrechte</StyledH4>
      <StyledUl>
        <li>
          <LiContainer>
            <div>
              Die Autoren müssen mit der Veröffentlichung einverstanden sein
            </div>
          </LiContainer>
        </li>
        <li>
          <LiContainer>
            <div>Dafür verantwortlich ist, wer Daten importiert</div>
          </LiContainer>
        </li>
      </StyledUl>
      <StyledH4>Tabelle</StyledH4>
      <StyledUl>
        <li>
          <LiContainer>
            <div>Die erste Zeile enthält Feld-Namen (= Spalten-Titel)</div>
          </LiContainer>
        </li>
        <li>
          <LiContainer>
            <div>
              Jeder Wert hat einen Feld-Namen.
              <br />
              Anders gesagt: Jede Zelle mit einem Wert hat einen Spalten-Titel
            </div>
            {existsNoDataWithoutKey && (
              <div>
                <InlineIcon>
                  <StyledDoneIcon />
                </InlineIcon>
              </div>
            )}
            {existsNoDataWithoutKey === false && (
              <div>
                <InlineIcon>
                  <StyledErrorIcon />
                </InlineIcon>
              </div>
            )}
          </LiContainer>
        </li>
      </StyledUl>
      <StyledH4>Zuordnungs-Felder</StyledH4>
      <StyledUl>
        <li>
          <LiContainer>
            <div>
              Ein Feld namens <EmSpan>id</EmSpan> kann enthalten sein.
            </div>
            {idsExist && (
              <div>
                <InlineIcon>
                  <StyledDoneIcon />
                </InlineIcon>
              </div>
            )}
            {idsExist === false && (
              <div>
                <InlineDiv>(ist nicht)</InlineDiv>
              </div>
            )}
          </LiContainer>
          <LiContainer>
            <div>Wenn nicht, wird eine id erzeugt</div>
            {idsExist === false && (
              <div>
                <InlineIcon>
                  <StyledDoneIcon />
                </InlineIcon>
              </div>
            )}
          </LiContainer>
          <ul>
            <li>
              <LiContainer>
                <div>
                  <EmSpan>id</EmSpan> muss gültige{' '}
                  <a
                    href="https://de.wikipedia.org/wiki/Universally_Unique_Identifier"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    UUID
                  </a>{' '}
                  sein
                </div>
                {idsAreUuids && (
                  <div>
                    <InlineIcon>
                      <StyledDoneIcon />
                    </InlineIcon>
                  </div>
                )}
                {idsAreUuids === false && (
                  <div>
                    <InlineIcon>
                      <StyledErrorIcon />
                    </InlineIcon>
                  </div>
                )}
              </LiContainer>
            </li>
            <li>
              <LiContainer>
                <div>
                  <EmSpan>id</EmSpan> muss eindeutig sein
                </div>
                {idsAreUnique && (
                  <div>
                    <InlineIcon>
                      <StyledDoneIcon />
                    </InlineIcon>
                  </div>
                )}
                {idsAreUnique === false && (
                  <div>
                    <InlineIcon>
                      <StyledErrorIcon />
                    </InlineIcon>
                  </div>
                )}
              </LiContainer>
            </li>
          </ul>
        </li>
        <li>
          <LiContainer>
            <div>
              Ein Feld namens <EmSpan>objectId</EmSpan> muss enthalten sein
            </div>
            {objectIdsExist && (
              <div>
                <InlineIcon>
                  <StyledDoneIcon />
                </InlineIcon>
              </div>
            )}
            {objectIdsExist === false && (
              <div>
                <InlineIcon>
                  <StyledErrorIcon />
                </InlineIcon>
              </div>
            )}
          </LiContainer>
          <ul>
            <li>
              <LiContainer>
                <div>
                  <EmSpan>objectId</EmSpan> muss gültige{' '}
                  <a
                    href="https://de.wikipedia.org/wiki/Universally_Unique_Identifier"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    UUID
                  </a>{' '}
                  sein
                </div>
                {objectIdsAreUuid && (
                  <div>
                    <InlineIcon>
                      <StyledDoneIcon />
                    </InlineIcon>
                  </div>
                )}
                {objectIdsAreUuid === false && (
                  <div>
                    <InlineIcon>
                      <StyledErrorIcon />
                    </InlineIcon>
                  </div>
                )}
              </LiContainer>
            </li>
            <li>
              <LiContainer>
                <div>
                  <EmSpan>objectId</EmSpan> muss <EmSpan>id</EmSpan> eines
                  Objekts aus arteigenschaften.ch sein
                </div>
                {objectIdsAreReal && (
                  <div>
                    <InlineIcon>
                      <StyledDoneIcon />
                    </InlineIcon>
                  </div>
                )}
                {objectIdsAreReal === false && !objectIdsAreRealNotTested && (
                  <div>
                    <InlineIcon>
                      <StyledErrorIcon />
                    </InlineIcon>
                  </div>
                )}
                {objectIdsAreRealNotTested && (
                  <>
                    <InlineIcon>
                      <StyledInfoOutlineIcon />
                    </InlineIcon>
                    <InlineDiv>
                      (nicht getestet, da sehr viele Daten. Datensätze, welche
                      dieses Kriterium nicht erfüllen, werden nicht importiert)
                    </InlineDiv>
                  </>
                )}
              </LiContainer>
            </li>
          </ul>
        </li>
        <li>
          <LiContainer>
            <div>
              Ein Feld namens <EmSpan>propertyCollectionOfOrigin</EmSpan> kann
              enthalten sein.
            </div>
            {pCOfOriginIdsExist && (
              <div>
                <InlineIcon>
                  <StyledDoneIcon />
                </InlineIcon>
              </div>
            )}
            {pCOfOriginIdsExist === false && (
              <div>
                <InlineDiv>(ist nicht)</InlineDiv>
              </div>
            )}
          </LiContainer>
          <LiContainer>
            <div>
              Zweck: In zusammenfassenden Eigenschaften-Sammlungen markieren,
              aus welcher Eigenschaften-Sammlung diese Eigenschaften stammen.{' '}
              <a
                href="http://localhost:8000/Dokumentation/Projektbeschreibung/#zusammenfassende-eigenschaften-sammlungen"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mehr Infos
              </a>
            </div>
          </LiContainer>
          <ul>
            <li>
              <LiContainer>
                <div>
                  <EmSpan>propertyCollectionOfOrigin</EmSpan> muss gültige{' '}
                  <a
                    href="https://de.wikipedia.org/wiki/Universally_Unique_Identifier"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    UUID
                  </a>{' '}
                  sein
                </div>
                {pCOfOriginIdsAreUuid && (
                  <div>
                    <InlineIcon>
                      <StyledDoneIcon />
                    </InlineIcon>
                  </div>
                )}
                {pCOfOriginIdsAreUuid === false && (
                  <div>
                    <InlineIcon>
                      <StyledErrorIcon />
                    </InlineIcon>
                  </div>
                )}
              </LiContainer>
            </li>
            <li>
              <LiContainer>
                <div>
                  <EmSpan>propertyCollectionOfOrigin</EmSpan> muss{' '}
                  <EmSpan>id</EmSpan> einer Eigenschaften-Sammlung aus
                  arteigenschaften.ch sein
                </div>
                {pCOfOriginIdsAreReal && (
                  <div>
                    <InlineIcon>
                      <StyledDoneIcon />
                    </InlineIcon>
                  </div>
                )}
                {pCOfOriginIdsAreReal === false &&
                  !pCOfOriginIdsAreRealNotTested && (
                    <div>
                      <InlineIcon>
                        <StyledErrorIcon />
                      </InlineIcon>
                    </div>
                  )}
                {pCOfOriginIdsAreRealNotTested && (
                  <>
                    <InlineIcon>
                      <StyledInfoOutlineIcon />
                    </InlineIcon>
                    <InlineDiv>
                      (nicht getestet, da sehr viele Daten. Datensätze, welche
                      dieses Kriterium nicht erfüllen, werden nicht importiert)
                    </InlineDiv>
                  </>
                )}
              </LiContainer>
            </li>
          </ul>
        </li>
      </StyledUl>
      <StyledP>Alle weiteren Felder sind Eigenschaften des Objekts:</StyledP>
      <StyledH4>Eigenschaften</StyledH4>
      <StyledUl>
        <li>
          <LiContainer>
            <div>Es gibt mindestens eine Eigenschaft</div>
            {existsPropertyKey && (
              <div>
                <InlineIcon>
                  <StyledDoneIcon />
                </InlineIcon>
              </div>
            )}
            {existsPropertyKey === false && (
              <div>
                <InlineIcon>
                  <StyledErrorIcon />
                </InlineIcon>
              </div>
            )}
          </LiContainer>
        </li>
        <li>
          Feld-Namen dürfen die folgenden Zeichen nicht enthalten:
          <ul>
            <li>
              <LiContainer>
                <div>{'"'}</div>
                {propertyKeysDontContainApostroph && (
                  <div>
                    <InlineIcon>
                      <StyledDoneIcon />
                    </InlineIcon>
                  </div>
                )}
                {propertyKeysDontContainApostroph === false && (
                  <div>
                    <InlineIcon>
                      <StyledErrorIcon />
                    </InlineIcon>
                  </div>
                )}
              </LiContainer>
            </li>
            <li>
              <LiContainer>
                <div>\</div>
                {propertyKeysDontContainBackslash && (
                  <div>
                    <InlineIcon>
                      <StyledDoneIcon />
                    </InlineIcon>
                  </div>
                )}
                {propertyKeysDontContainBackslash === false && (
                  <div>
                    <InlineIcon>
                      <StyledErrorIcon />
                    </InlineIcon>
                  </div>
                )}
              </LiContainer>
            </li>
          </ul>
        </li>
        <li>
          Feld-Werte dürfen die folgenden Zeichen nicht enthalten:
          <ul>
            <li>
              <LiContainer>
                <div>{'"'}</div>
                {propertyValuesDontContainApostroph && (
                  <div>
                    <InlineIcon>
                      <StyledDoneIcon />
                    </InlineIcon>
                  </div>
                )}
                {propertyValuesDontContainApostroph === false && (
                  <div>
                    <InlineIcon>
                      <StyledErrorIcon />
                    </InlineIcon>
                  </div>
                )}
              </LiContainer>
            </li>
            <li>
              <LiContainer>
                <div>\</div>
                {propertyValuesDontContainBackslash && (
                  <div>
                    <InlineIcon>
                      <StyledDoneIcon />
                    </InlineIcon>
                  </div>
                )}
                {propertyValuesDontContainBackslash === false && (
                  <div>
                    <InlineIcon>
                      <StyledErrorIcon />
                    </InlineIcon>
                  </div>
                )}
              </LiContainer>
            </li>
          </ul>
        </li>
      </StyledUl>
      <StyledH3>Wirkung des Imports auf bereits vorhandene Daten</StyledH3>
      <ul>
        <li>
          Enthält die Eigenschaften-Sammlung bereits einen Datensatz für ein
          Objekt (Art oder Lebensraum), wird dieser mit dem importierten
          Datensatz ersetzt.
        </li>
        <li>
          Enthält die Eigenschaften-Sammlung für ein Objekt noch keinen
          Datensatz, wird er neu importiert.
        </li>
      </ul>
    </HowToImportContainer>
  </>
)

export default ImportPcoInstructions
