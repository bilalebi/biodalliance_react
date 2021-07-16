/**
 * See the NOTICE file distributed with this work for additional information
 * regarding copyright ownership.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useState } from 'react'
import InnerHTML from 'dangerously-set-html-content'

// Hook to make sure that the compiled 'dalliance-compiled.js' is ready before rendering the view
// thanks to: https://usehooks.com/useScript/
function useScript(src) {
  // Keep track of script status ("idle", "loading", "ready", "error")
  const [status, setStatus] = useState(src ? "loading" : "idle");

  useEffect(
    () => {
      // Allow falsy src value if waiting on other data needed for
      // constructing the script URL passed to this hook.
      if (!src) {
        setStatus("idle");
        return;
      }

      // Fetch existing script element by src
      // It may have been added by another intance of this hook
      let script = document.querySelector(`script[src="${src}"]`);

      if (!script) {
        // Create script
        script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.setAttribute("data-status", "loading");
        // Add script to document body
        document.body.appendChild(script);

        // Store status in attribute on script
        // This can be read by other instances of this hook
        const setAttributeFromEvent = (event) => {
          script.setAttribute(
            "data-status",
            event.type === "load" ? "ready" : "error"
          );
        };

        script.addEventListener("load", setAttributeFromEvent);
        script.addEventListener("error", setAttributeFromEvent);
      } else {
        // Grab existing script status from attribute and set to state.
        setStatus(script.getAttribute("data-status"));
      }

      // Script event handler to update status in state
      // Note: Even if the script already exists we still need to add
      // event handlers to update the state for *this* hook instance.
      const setStateFromEvent = (event) => {
        setStatus(event.type === "load" ? "ready" : "error");
      };

      // Add event listeners
      script.addEventListener("load", setStateFromEvent);
      script.addEventListener("error", setStateFromEvent);

      // Remove event listeners on cleanup
      return () => {
        if (script) {
          script.removeEventListener("load", setStateFromEvent);
          script.removeEventListener("error", setStateFromEvent);
        }
      };
    },
    [src] // Only re-run effect if script src changes
  );

  return status;
}

export default function BiodallianceView() {

  const status = useScript(
    "http://www.biodalliance.org/release-0.13/dalliance-compiled.js"
  );

  const scriptStr = `
         <script language="javascript">
             new Browser({
                 chr: '22',
                 viewStart: 30700000,
                 viewEnd: 30900000,
         
                 coordSystem: {
                     speciesName: 'Human',
                     taxon: 9606,
                     auth: 'GRCh',
                     version: '37',
                     ucscName: 'hg19'
                 },
         
                 sources: [{
                     name: 'Genome',
                     twoBitURI: '//www.biodalliance.org/datasets/hg19.2bit',
                     tier_type: 'sequence'
                 },
                     {
                         name: 'Genes',
                         desc: 'Gene structures from GENCODE 19',
                         bwgURI: '//www.biodalliance.org/datasets/gencode.bb',
                         stylesheet_uri: '//www.biodalliance.org/stylesheets/gencode.xml',
                         collapseSuperGroups: true,
                         trixURI: '//www.biodalliance.org/datasets/geneIndex.ix'
                     },
                     {
                         name: 'Repeats',
                         desc: 'Repeat annotation from Ensembl',
                         bwgURI: '//www.biodalliance.org/datasets/repeats.bb',
                         stylesheet_uri: '//www.biodalliance.org/stylesheets/bb-repeats.xml'
                     },
                     {
                         name: 'Conservation',
                         desc: 'Conservation',
                         bwgURI: '//www.biodalliance.org/datasets/phastCons46way.bw',
                         noDownsample: true
                     }],
         
             });
         </script>
         
         <div id="svgHolder"></div>
     `

  return (
    <>
      {
        status === "ready" && (
          <div>
            <em>dalliance-compiled.js</em> Script status: <b>{status}</b>
            {/* dangerouslySetInnerHtml won't work when there are scripts tags inside */}
            {/* more details here: https://www.npmjs.com/package/dangerously-set-html-content#tldr */}
            <InnerHTML html={scriptStr}/>
          </div>
        )
      }
    </>
  );
}